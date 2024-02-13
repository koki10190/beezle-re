use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::Client;
use serde::Deserialize;
use std::{env, ptr::null};
use steam_connect::Verify;

use actix_web::{
    get,
    http::{header::QualityItem, StatusCode},
    post,
    web::{self, Query},
    App, HttpRequest, HttpResponse, HttpServer, Responder,
};

use crate::{
    beezle,
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

// #[derive(Deserialize)]
// struct SteamQuery {
//     #[serde(rename = "openid.ns")]
//     ns: String,
//     #[serde(rename = "openid.mode")]
//     mode: String,
//     #[serde(rename = "openid.op_endpoint")]
//     op_endpoint: String,
//     #[serde(rename = "openid.claimed_id")]
//     claimed_id: String,
//     #[serde(rename = "openid.identity")]
//     identity: String,
//     #[serde(rename = "openid.return_to")]
//     return_to: String,
//     #[serde(rename = "openid.response_nonce")]
//     response_nonce: String,
//     #[serde(rename = "openid.invalidate_handle")]
//     invalidate_handle: Option<String>,
//     #[serde(rename = "openid.assoc_handle")]
//     assoc_handle: String,
//     #[serde(rename = "openid.signed")]
//     signed: String,
//     #[serde(rename = "openid.sig")]
//     sig: String,
// }

#[derive(Deserialize)]
struct SteamBody {
    token: String,
}

#[post("/api/connections/steam_disconnect")]
pub async fn route(
    body: web::Json<SteamBody>,
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
            "$unset": {
                "connections.steam": ""
            }
        },
    )
    .await;

    Ok(HttpResponse::Ok().body("Steam account disconnected."))
}
