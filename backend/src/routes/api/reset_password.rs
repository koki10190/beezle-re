use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::Predicate;
use serde::Deserialize;
use std::env;

use actix_web::{
    delete, get, http::StatusCode, patch, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder
};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct ChangePassQuery {
    email: String,
    password: String,
}

#[post("/api/reset_password")]
pub async fn route(
    req: HttpRequest,
    body: web::Json<ChangePassQuery>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
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
        doc! { "email": &body.email },
    )
    .await;

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"deleted": false,"error": "Not Found!"}),
        Some(doc) => {
            let authID = uuid::Uuid::new();
            let _email = doc.get("email").unwrap().as_str().unwrap().to_string();
            let _handle = doc.get("handle").unwrap().as_str().unwrap().to_string();
            let struct_auth_doc = mongoose::structures::auth::ChangePassAuth {
                id: None,
                handle: _handle.clone(),
                email: _email.clone(),
                auth_id: authID.to_string(),
                hash_password: hashed_pass.to_string(),
            };

            let serialized_auth_doc = mongodb::bson::to_bson(&struct_auth_doc).unwrap();
            let auth_document = serialized_auth_doc.as_document().unwrap();

            mongoose::insert_document(&client, "beezle", "ChangePassAuths", auth_document.clone())
                .await;

            beezle::mail::send_html(
                &_email,
                "Change Password",
                format!(
                    "Hello {}!\nSeems like you forgot your password and want to reset it. Click the URL to change your pasword for your account \"@{}\": {}\n\n<h1>DO NOT Click on the link if you did not request this!</h1>\nIP Address of the requester: {}",
                    _handle.as_str(),
                    _handle.as_str(),
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
