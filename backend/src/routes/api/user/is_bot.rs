use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::Predicate;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, patch, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct Query {
    is_bot: bool
}

#[patch("/api/user/set_bot")]
pub async fn route(
    req: HttpRequest,
    body: web::Json<Query>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token = get_token(&req).unwrap(); 
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &token,
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
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        _document => {
            let doc = _document.unwrap();

            mongoose::update_document(&client, "beezle", "Users", doc!{ "handle": &token_data.handle, "hash_password": &token_data.hash_password }, doc!{
                "$set": {
                    "is_bot": body.is_bot
                }
            }).await;

            HttpResponse::Ok().json(doc! {"message": "Changed."})
        },
    }
}
