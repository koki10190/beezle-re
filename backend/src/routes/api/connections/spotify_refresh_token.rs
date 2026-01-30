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
    beezle::{self, crypt::{base64_encode, decrypt, encrypt}},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct SpotifyRefreshTokenResponse {
    access_token: String,
}

#[derive(Deserialize)]
struct QueryData {
    handle: String
}

#[patch("/api/connections/spotify/refresh_token")]
pub async fn route(
    body: web::Query<QueryData>,
    client: web::Data<Client>,
) -> actix_web::Result<HttpResponse> {

    Ok(HttpResponse::Ok().body("This API Endpoint is inactive now. Token Refreshing is handled manually."))
}

pub async fn refresh_token(client: &Client, handle: String) -> String {
    let reqwest_client = reqwest::Client::new();
    let client_id = env::var("SPOTIFY_CLIENT_ID").unwrap();
    let client_secret = env::var("SPOTIFY_CLIENT_SECRET").unwrap();
    let pass = env::var("ENCRYPT_PASSWORD").unwrap();

    let user = mongoose::get_document(&client, "beezle", "Users", doc!{
        "handle": &handle
    }).await.unwrap();

    let users_refresh_token = user.get("connections")
        .expect("Connections doesn't exist")
        .as_document().unwrap().get("spotify")
        .expect("Spotify is not connected")
        .as_document().unwrap().get("refresh_token").unwrap();

    let decrypted_refresh_token = decrypt(
        &users_refresh_token.as_str().unwrap(),
        &pass
    ).unwrap();

    let decoded_refresh_token = String::from_utf8(decrypted_refresh_token).unwrap();


    let body_str = format!(
        "grant_type={}&refresh_token={}",
        "refresh_token",
        decoded_refresh_token
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

    let encrypted_access_token = encrypt(response.get("access_token").unwrap().as_str().unwrap(), &pass).unwrap();
    let acc_tok = base64_encode(encrypted_access_token);
    mongoose::update_document(
        &client,
        "beezle",
        "Users",
        doc! {
            "handle": &handle
        },
        doc! {
            "$set": {
                "connections.spotify.access_token": &acc_tok,
            }
        },
    )
    .await;

    acc_tok.clone()
}