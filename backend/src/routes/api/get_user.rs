use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::Predicate;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    token: String,
}

#[post("/api/get_user")]
pub async fn route(
    body: web::Json<GetUserQuery>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    beezle::print(&body.token);
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;
    beezle::print("get_user private 2");

    let auth_doc = mongoose::get_document(
        &client,
        "beezle",
        "Users",
        doc! { "handle": &token_data.handle, "hash_password": &token_data.hash_password },
    )
    .await;
    beezle::print("get_user private 3");

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        _document => HttpResponse::Ok().json(_document),
    }
}
