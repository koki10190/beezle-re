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
    code: String,
}

#[post("/api/connections/discord_auth")]
pub async fn route(
    body: web::Json<DataBody>,
    client: web::Data<Client>,
    req: HttpRequest
) -> actix_web::Result<HttpResponse> {
    let token = get_token(&req).unwrap();
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    beezle::print("Got beezle token information");

    let reqwest_client = reqwest::Client::new();

    let client_id = env::var("DISCORD_CLIENT_ID").unwrap();
    let client_secret = env::var("DISCORD_CLIENT_SECRET").unwrap();

    let body_str = format!(
        "grant_type={}&code={}&redirect_uri={}",
        "authorization_code",
        &body.code,
        "https://beezle.lol/discord_auth",
    );

    let encoded_secret = base64_encode(format!("{}:{}", client_id, client_secret).as_bytes().to_vec());

    beezle::print(format!("full query:\n{}", body_str).as_str());
    let response = reqwest_client.post(
        "https://discord.com/api/oauth2/token"
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


    let user_body_str = format!(
        "grant_type={}&code={}&redirect_uri={}",
        "authorization_code",
        &body.code,
        "https://beezle.lol/discord_auth",
    );
    let _user_data_response = reqwest_client.get(
        "https://discord.com/api/users/@me"
    )
    .header("Authorization", format!("Bearer {}", response.get("access_token").unwrap().as_str().unwrap()))
    .send()
    .await
    .unwrap()
    .json::<Document>().await;

    match _user_data_response {
        Ok(user_data_response) => {
            mongoose::update_document(
                &client,
                "beezle",
                "Users",
                doc! {
                    "handle": &token_data.handle
                },
                doc! {
                    "$set": {
                        "connections.discord": {
                            "access_token": base64_encode(encrypted_access_token),
                            "refresh_token": base64_encode(encrypted_refresh_token),
                            "data": {
                                "username": user_data_response.get("username").unwrap().as_str().unwrap().to_string(),
                                "display_name": user_data_response.get("global_name").unwrap().as_str().unwrap().to_string(),
                                "discord_id": user_data_response.get("id").unwrap().as_str().unwrap().to_string(),
                                "avatar": user_data_response.get("avatar").unwrap().as_str().unwrap().to_string(),
                            }
                        }
                    }
                },
            )
            .await;
        }
        Err(err) => {
            println!("{:?}", err);
        }
    }


    beezle::print("Saved tokens!");

    Ok(HttpResponse::Ok().body("Discord account connected!"))
}
