use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::Predicate;
use serde::Deserialize;
use std::env;

use actix_web::{
    delete, get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder,
};

use crate::{
    beezle,
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    token: String,
}

#[post("/api/user/delete")]
pub async fn route(
    body: web::Json<GetUserQuery>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

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
            mongoose::delete_document(
                &client,
                "beezle",
                "Users",
                doc! {
                    "handle": &token_data.handle,
                    "hash_password": token_data.hash_password
                },
            )
            .await;
            mongoose::delete_many_document(
                &client,
                "beezle",
                "Posts",
                doc! {
                    "handle": &token_data.handle,
                },
            )
            .await;
            HttpResponse::Ok().json(doc! {"deleted": true})
        }
    }
}
