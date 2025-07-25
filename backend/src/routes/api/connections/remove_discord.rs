use actix_multipart::form::json;
use aes_gcm::Aes256Gcm;
use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::Client;
use serde::Deserialize;
use serialize_with_password::serialize;
use std::env;
use steam_connect::Verify;

use actix_web::{
    get, http::{header::QualityItem, StatusCode}, patch, post, web::{self, JsonBody, Query}, App, HttpRequest, HttpResponse, HttpServer, Responder
};

use crate::{
    beezle::{self, auth::get_token, crypt::{base64_encode, encrypt}},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct AuthTokenResponse {
    access_token: String,
    token_type: String,
    expires_in: i64,
    refresh_token: String,
    scope: String
}

#[derive(Deserialize)]
struct DataBody {
}

#[patch("/api/connections/remove_discord")]
pub async fn route(
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
                "connections.discord": ""
            }
        },
    )
    .await;

    beezle::print("Disconnected the account!");

    Ok(HttpResponse::Ok().body("Discord account disconnected!"))
}
