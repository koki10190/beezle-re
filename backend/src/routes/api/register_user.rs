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
    if body.email == "" {
        return HttpResponse::Ok().json(doc! { "error": "No email provided!" });
    }

    if body.handle == "" {
        return HttpResponse::Ok().json(doc! { "error": "No handle provided!" });
    }

    if body.password == "" {
        return HttpResponse::Ok().json(doc! { "error": "No password provided!" });
    }

    if body.password.len() < 8 {
        return HttpResponse::Ok().json(doc! { "error": "Password must be atleast 8 characters!" });
    }

    if body.username == "" {
        return HttpResponse::Ok().json(doc! { "error": "No username provided!" });
    }

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
                badges: [].to_vec(),
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

            HttpResponse::Ok()
                .json(doc! {"message": "Check your email (and spam) to verify your account."})
        }
        Document => HttpResponse::Ok()
            .json(doc! { "error": "User with the same email and/or handle exists!" }),
    }
}
