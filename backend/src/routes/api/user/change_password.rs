use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::Predicate;
use serde::Deserialize;
use std::env;

use actix_web::{
    delete, get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder,
};

use crate::{
    beezle,
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct ChangePassQuery {
    token: String,
    password: String,
}

#[post("/api/user/change_password")]
pub async fn route(
    req: HttpRequest,
    body: web::Json<ChangePassQuery>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    if body.password == "" {
        return HttpResponse::Ok().json(doc! { "error": "No password provided!" });
    }

    if body.password.len() < 8 {
        return HttpResponse::Ok().json(doc! { "error": "Password must be atleast 8 characters!" });
    }

    let hashed_pass = beezle::crypt::hash_password(&body.password).to_string();

    let auth_doc = mongoose::get_document(
        &client,
        "beezle",
        "Users",
        doc! { "handle": &token_data.handle, "hash_password": &token_data.hash_password },
    )
    .await;

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"deleted": false,"error": "Not Found!"}),
        _document => {
            let authID = uuid::Uuid::new();
            let struct_auth_doc = mongoose::structures::auth::ChangePassAuth {
                id: None,
                handle: token_data.handle.to_string(),
                email: token_data.email.to_string(),
                auth_id: authID.to_string(),
                hash_password: hashed_pass.to_string(),
            };

            let serialized_auth_doc = mongodb::bson::to_bson(&struct_auth_doc).unwrap();
            let auth_document = serialized_auth_doc.as_document().unwrap();

            mongoose::insert_document(&client, "beezle", "ChangePassAuths", auth_document.clone())
                .await;

            beezle::mail::send_html(
                &token_data.email,
                "Change Password",
                format!(
                    "Hello {}!\nClick the URL to change your pasword for your account \"@{}\": {}\n\n<h1>DO NOT Click on the link if you did not request this!</h1>\nIP Address of the requester: {}",
                    token_data.handle.as_str(),
                    token_data.handle.as_str(),
                    format!("https://beezle.lol/verify_pass/{}", authID).as_str(),
                    req.connection_info().realip_remote_addr().unwrap().to_string()
                )
                .as_str(),
            )
            .await;

            HttpResponse::Ok().json(doc! {"message": "Check your email to verify changes."})
        }
    }
}
