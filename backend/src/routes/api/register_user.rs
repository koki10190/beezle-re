use bson::{doc, uuid, Document};
use chrono::Utc;
use jsonwebtoken::{EncodingKey, Header};
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{beezle, mongoose};

#[derive(Deserialize)]
struct RegistrationInfo {
    username: String,
    handle: String,
    email: String,
    password: String,
}

#[post("/api/register_user")]
pub async fn route(
    client: web::Data<mongodb::Client>,
    req: HttpRequest,
    body: web::Json<RegistrationInfo>,
) -> impl Responder {
    let mut doc = mongoose::get_document(
        &client,
        "beezle",
        "Users",
        doc! {"$or": [
            {
                "email": body.email.clone()
            },
            {
                "handle": body.handle.clone()
            }
        ]},
    )
    .await;

    match doc {
        None => {
            let struct_user_doc = mongoose::structures::User {
                id: None,
                handle: body.handle.to_string(),
                username: body.username.to_string(),
                email: body.email.to_string(),
                hash_password: beezle::crypt::hash_password(&body.password).to_string(),
                creation_date: chrono::offset::Utc::now(),
                verified: false,
                avatar: "https://i.imgur.com/yiuTHhc.png".to_string(),
                banner: "https://i.imgur.com/yiuTHhc.png".to_string(),
                about_me: "Hello! I'm new here!".to_string(),
            };

            let serialized_user_doc = mongodb::bson::to_bson(&struct_user_doc).unwrap();
            let document = serialized_user_doc.as_document().unwrap();

            mongoose::insert_document(&client, "beezle", "Users", document.clone()).await;

            doc = mongoose::get_document(
                &client,
                "beezle",
                "Users",
                doc! {"email": struct_user_doc.email, "handle": struct_user_doc.handle},
            )
            .await;
            let authID = uuid::Uuid::new();
            let struct_auth_doc = mongoose::structures::auth::Auth {
                id: None,
                handle: body.handle.to_string(),
                email: body.email.to_string(),
                auth_id: authID.to_string(),
            };

            let serialized_auth_doc = mongodb::bson::to_bson(&struct_auth_doc).unwrap();
            let auth_document = serialized_auth_doc.as_document().unwrap();

            mongoose::insert_document(&client, "beezle", "Auths", auth_document.clone()).await;

            if let Some(val) = req.peer_addr() {
                beezle::mail::send(
                    &body.email,
                    "Verify your account",
                    format!(
                        "Hello {}!\nClick the URL to verify your account \"@{}\": {}\n\nDO NOT Click on the link if the account wasn't made by you!\nIP Address of the requester: {}",
                        body.handle.as_str(),
                        body.handle.as_str(),
                        format!("http://localhost:3000/api/verify?auth_id={}", authID).as_str(),
                        val.to_string().as_str()
                    )
                    .as_str(),
                )
                .await;
            };

            let jwt_user = mongoose::structures::user::JwtUser {
                handle: body.handle.to_string(),
                username: body.username.to_string(),
                email: body.email.to_string(),
                exp: chrono::TimeZone::with_ymd_and_hms(&Utc, 2050, 1, 1, 0, 0, 0)
                    .unwrap()
                    .timestamp() as usize,
            };

            let token = jsonwebtoken::encode(
                &Header::default(),
                &jwt_user,
                &EncodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
            )
            .unwrap();

            HttpResponse::Ok().json(doc! {"token": token})
        }
        Document => HttpResponse::Ok()
            .json(doc! { "error": "User with the same email and/or handle exists!" }),
    }
}
