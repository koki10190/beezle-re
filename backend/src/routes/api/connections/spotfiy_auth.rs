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
    get,
    http::{header::QualityItem, StatusCode},
    post,
    web::{self, JsonBody, Query},
    App, HttpRequest, HttpResponse, HttpServer, Responder,
};

use crate::{
    beezle::{self, crypt::{base64_encode, encrypt}},
    mongoose::{self, structures::user},
    poison::LockResultExt,
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
struct SteamBody {
    code: String,
    token: String,
}

#[post("/api/connections/spotify_auth")]
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

    beezle::print("Got beezle token information");

    let reqwest_client = reqwest::Client::new();

    let client_id = env::var("SPOTIFY_CLIENT_ID").unwrap();
    let client_secret = env::var("SPOTIFY_CLIENT_SECRET").unwrap();

    let body_str = format!(
        "grant_type={}&code={}&redirect_uri={}&client_id={}&client_secret={}",
        "authorization_code",
        &body.code,
        "https://beezle.lol/spotify-auth",
        client_id,
        client_secret
    );

    let encoded_secret = base64_encode(format!("{}:{}", client_id, client_secret).as_bytes().to_vec());

    beezle::print(format!("full query:\n{}", body_str).as_str());
    let response = reqwest_client.post(
        "https://accounts.spotify.com/api/token"
    ).body(body_str)
    .header("Content-Type", "application/x-www-form-urlencoded")
    .header("Authorization", format!("Basic {}", encoded_secret))
    .send()
    .await
    .unwrap()
    .json::<Document>()
    .await
    .unwrap();

    beezle::print("Request sent, encrypting data...");
    beezle::print(format!("{:?}", response).as_str());

    let pass = env::var("ENCRYPT_PASSWORD").unwrap();
    let encrypted_access_token = encrypt(response.get("access_token").unwrap().as_str().unwrap(), &pass).unwrap();
    let encrypted_refresh_token = encrypt(response.get("refresh_token").unwrap().as_str().unwrap(), &pass).unwrap();

    beezle::print("Data encrypted! Getting user info");

    let user_data_response = reqwest_client.get(
        "https://api.spotify.com/v1/me"
    )
    .header("Authorization", format!("Bearer {}", response.get("access_token").unwrap().as_str().unwrap()))
    .send()
    .await
    .unwrap()
    .json::<Document>()
    .await
    .unwrap();

    mongoose::update_document(
        &client,
        "beezle",
        "Users",
        doc! {
            "handle": &token_data.handle
        },
        doc! {
            "$set": {
                "connections.spotify": {
                    "access_token": base64_encode(encrypted_access_token),
                    "refresh_token": base64_encode(encrypted_refresh_token),
                    "display_name": user_data_response.get("display_name").unwrap().as_str().unwrap(),
                    "id": user_data_response.get("id").unwrap().as_str().unwrap(),
                    "external_urls": user_data_response.get("external_urls").unwrap().as_document().unwrap(),
                    "product": user_data_response.get("product").unwrap().as_str().unwrap(),
                    "images": user_data_response.get("images").unwrap().as_array().unwrap(),
                }
            }
        },
    )
    .await;

    beezle::print("Saved tokens!");

    Ok(HttpResponse::Ok().body("Spotify account connected!"))
}
