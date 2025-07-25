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
    beezle::{self, auth::verify_token, crypt::{base64_encode, decrypt, encrypt}},
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

#[get("/api/connections/spotify/status")]
pub async fn route(
    body: web::Query<QueryData>,
    client: web::Data<Client>,
    req: HttpRequest
) -> actix_web::Result<HttpResponse> {
    if !verify_token(&client, &req).await {
        return Ok(HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"}));
    }
    
    let reqwest_client = reqwest::Client::new();

    let client_id = env::var("SPOTIFY_CLIENT_ID").unwrap();
    let client_secret = env::var("SPOTIFY_CLIENT_SECRET").unwrap();
    let pass = env::var("ENCRYPT_PASSWORD").unwrap();

    let user = mongoose::get_document(&client, "beezle", "Users", doc!{
        "handle": &body.handle
    }).await.unwrap();


    let encoded_secret = base64_encode(format!("{}:{}", client_id, client_secret).as_bytes().to_vec());

    let users_access_token = user.get("connections")
        .expect("Connections doesn't exist")
        .as_document().unwrap().get("spotify")
        .expect("Spotify is not connected")
        .as_document().unwrap().get("access_token").unwrap();

    let decrypted_access_token = decrypt(
        &users_access_token.as_str().unwrap(),
        &pass
    ).unwrap();

    let decoded_access_token = String::from_utf8(decrypted_access_token).unwrap();
    

    println!("\n\n\"{}\"\n\n", decoded_access_token);

    let response = reqwest_client.get(
        "https://api.spotify.com/v1/me/player/currently-playing"
    )
    .header("Content-Type", "application/json")
    .header("Authorization", format!("Bearer {}", decoded_access_token))
    .send()
    .await
    .expect("FAGGOTS")
    .json::<Document>()
    .await;

    match response {
        Ok(data) => {
            if data.get("error").is_none() {
                Ok(HttpResponse::Ok().json(data))
            } else {
                Ok(HttpResponse::Ok().json(doc!{"error": "Access token is expired."}))
            }
        }
        Err(err) => {
            println!("{:?}", err);
            Ok(HttpResponse::Ok().json(doc!{"error": "Error occured!"}))
        }
    }
}
