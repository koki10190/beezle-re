use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::Predicate;
use serde::Deserialize;
use std::env;

use actix_web::{
    delete, get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder
};

use crate::{
    beezle::{self, auth::get_token, is_mod, is_owner},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    handle: String,
    reason: String,
}

#[post("/api/user/ban")]
pub async fn route(
    body: web::Json<GetUserQuery>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &get_token(&req).unwrap(),
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    if !is_mod(&client, token_data.handle.to_string()).await {
        return HttpResponse::Ok().json(doc! {"error": "User is not a moderator!"});
    }
    let auth_doc =
        mongoose::get_document(&client, "beezle", "Users", doc! { "handle": &body.handle }).await;

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        _document => {
            if is_mod(&client, body.handle.to_string()).await {
                return HttpResponse::Ok().json(doc! {"error": "Cannot ban a moderator!"});
            }

            if is_owner(&client, body.handle.to_string()).await {
                return HttpResponse::Ok().json(doc! {"error": "Cannot ban an owner!"});
            }
            let m_doc = _document.unwrap();

            let mail = m_doc.get("email").unwrap().as_str().unwrap();

            beezle::mail::send(
                mail,
                "Your account has been banned.",
                format!(
                    "Your account @{} has been banned by @{}\n\nBan Reason:\n{}\n\nIf you believe this ban was not justified, please email the owner at koki@beezle.lol\n\nThe bestest of best,\nThe Beezle Hive",
                    &body.handle, &token_data.handle, &body.reason
                )
                .as_str(),
            )
            .await;

            mongoose::delete_document(
                &client,
                "beezle",
                "Users",
                doc! {
                    "handle": &body.handle
                },
            )
            .await;
            mongoose::delete_many_document(
                &client,
                "beezle",
                "Posts",
                doc! {
                    "handle": &body.handle
                },
            )
            .await;
            HttpResponse::Ok().json(doc! {"message": format!("@{} has been banned.", &body.handle)})
        }
    }
}
