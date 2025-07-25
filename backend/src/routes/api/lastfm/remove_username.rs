use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::Client;
use serde::Deserialize;
use std::env;
use steam_connect::Verify;

use actix_web::{
    delete, get, http::{header::QualityItem, StatusCode}, patch, post, web::{self, Query}, App, HttpRequest, HttpResponse, HttpServer, Responder
};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct AuthBody {
}

#[delete("/api/lastfm/remove_username")]
pub async fn route(
    body: web::Json<AuthBody>,
    req: HttpRequest,
    client: web::Data<Client>,
) -> actix_web::Result<HttpResponse> {
    let token = get_token(&req).unwrap();
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &token,
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
            "$unset": {
                "connections.lastfm": ""
            }
        },
    )
    .await;

    Ok(HttpResponse::Ok().body("last.fm disconnected"))
}
