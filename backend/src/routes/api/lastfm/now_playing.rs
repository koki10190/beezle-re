use actix_multipart::form::json;
use aes_gcm::Aes256Gcm;
use bson::{doc, Document};
use genius_rust::Genius;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::Client;
use serde::Deserialize;
use serialize_with_password::serialize;
use std::env;
use steam_connect::Verify;

use actix_web::{
    get,
    http::{header::QualityItem, StatusCode},
    post,
    web::{self, JsonBody, Query},
    App, HttpRequest, HttpResponse, HttpServer, Responder,
};

use crate::{
    beezle::{self, auth::verify_token, crypt::{base64_encode, encrypt}},
    mongoose::{self, structures::user},
    poison::LockResultExt, routes::api::post::get::now,
};

#[derive(Deserialize)]
struct SpotifyTokenResponse {
    access_token: String,
    token_type: String,
    expires_in: i64,
    refresh_token: String,
    scope: String
}

#[derive(Deserialize)]
struct QueryBody {
    username: String,
}

#[get("/api/lastfm/now_playing")]
pub async fn route(
    body: web::Query<QueryBody>,
    client: web::Data<Client>,
    req: HttpRequest
) -> actix_web::Result<HttpResponse> {
    if !verify_token(&client, &req).await {
        return Ok(HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"}));
    }

    let lastfm_apikey = env::var("LASTFM_API_KEY").unwrap();
    let lastfm_client = lastfm::Client::builder().api_key(lastfm_apikey).username(&body.username).build();

    let now_playing = lastfm_client.now_playing().await;

    match now_playing  {
        Ok(result) => {
            if let Some(track) = result {
                return Ok(HttpResponse::Ok().json(track));
            }

            Ok(HttpResponse::Ok().json(doc!{"error": "Not Playing!"}))
        }
        Err(err) => {
            Ok(HttpResponse::Ok().json(doc!{"error": "Not Playing!"}))
        }
    }

    // Ok(HttpResponse::Ok().json(now_playing))
}
