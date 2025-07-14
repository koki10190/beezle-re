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
    beezle::{self, crypt::{base64_encode, encrypt}},
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

#[get("/api/lastfm/get_user")]
pub async fn route(
    body: web::Query<QueryBody>,
    client: web::Data<Client>,
) -> actix_web::Result<HttpResponse> {
    let reqwest_client = reqwest::Client::new();

    let lastfm_apikey = env::var("LASTFM_API_KEY").unwrap();
    
    let body_str = format!(
        "https://ws.audioscrobbler.com/2.0?api_key={}&method={}&format={}&user={}",
        lastfm_apikey,
        "user.getInfo",
        "json",
        body.username
    );


    let response = reqwest_client.get(
        body_str
    )
    .header("Content-Type", "application/json")
    .send()
    .await
    .expect("FAGGOTS")
    .json::<Document>()
    .await;

    match response  {
        Ok(result) => {
            Ok(HttpResponse::Ok().json(result))
        }
        Err(err) => {
            println!("Error: {:?}", err);
            Ok(HttpResponse::Ok().json(doc!{"error": "Couldn't get json data!"}))
        }
    }
    // Ok(HttpResponse::Ok().json(now_playing))
}
