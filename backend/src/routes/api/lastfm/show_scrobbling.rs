use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::Client;
use serde::Deserialize;
use std::env;
use steam_connect::Verify;

use actix_web::{
    get, http::{header::QualityItem, StatusCode}, patch, post, web::{self, Query}, App, HttpRequest, HttpResponse, HttpServer, Responder
};

use crate::{
    beezle,
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct AuthBody {
    token: String,
    show: bool
}

#[patch("/api/lastfm/show_scrobbling")]
pub async fn route(
    body: web::Json<AuthBody>,
    client: web::Data<Client>,
) -> actix_web::Result<HttpResponse> {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    mongoose::update_document(
        &client,
        "beezle",
        "Users",
        doc! {
            "handle": &token_data.handle
        },
        doc! {
            "$set": {
                "connections.lastfm.show_scrobbling": &body.show
            }
        },
    )
    .await;

    Ok(HttpResponse::Ok().body("last.fm show scrobbling set!"))
}
