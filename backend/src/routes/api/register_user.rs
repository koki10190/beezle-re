use bson::{doc, uuid, Document};
use chrono::Utc;
use jsonwebtoken::{EncodingKey, Header};
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    mongoose::{self, structures::user::UserLevels},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct RegistrationInfo {
    username: String,
    handle: String,
    email: String,
    password: String,
}

#[post("/api/register_user")]
pub async fn route(
    req: HttpRequest,
    body: web::Json<RegistrationInfo>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    if body.email == "" {
        return HttpResponse::Ok().json(doc! { "error": "No email provided!" });
    }
    let mut act_handle: String = body.handle.chars().filter(|c| !c.is_whitespace()).collect();
    act_handle = act_handle.to_lowercase();

    if act_handle == "" {
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

    if body.username.len() > 12 {
        return HttpResponse::Ok()
            .json(doc! { "error": "Username must be shorter than 12 characters!" });
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
                "handle": act_handle.clone()
            }
        ]},
    )
    .await;

    match doc {
        None => {
            let struct_user_doc = mongoose::structures::User {
                id: None,
                handle: act_handle.clone(),
                username: body.username.to_string(),
                email: body.email.to_string(),
                hash_password: beezle::crypt::hash_password(&body.password).to_string(),
                creation_date: chrono::offset::Utc::now(),
                verified: false,
                avatar: "https://i.imgur.com/yiuTHhc.png".to_string(),
                banner: "https://i.imgur.com/yiuTHhc.png".to_string(),
                about_me: "Hello! I'm new here!".to_string(),
                badges: vec![],
                bookmarks: vec![],
                followers: vec![],
                following: vec![],
                reputation: 100,
                coins: 0,
                notifs: vec![],
                levels: UserLevels { level: 0, xp: 0 },
                activity: "".to_string(),
            };

            let serialized_user_doc = mongodb::bson::to_bson(&struct_user_doc).unwrap();
            let document = serialized_user_doc.as_document().unwrap();

            mongoose::insert_document(&client, "beezle", "Users", document.clone()).await;

            doc = mongoose::get_document(
                &client,
                "beezle",
                "Users",
                doc! {"email": struct_user_doc.email, "handle": struct_user_doc.handle.to_lowercase()},
            )
            .await;
            let authID = uuid::Uuid::new();
            let struct_auth_doc = mongoose::structures::auth::Auth {
                id: None,
                handle: act_handle.to_lowercase(),
                email: body.email.to_string(),
                auth_id: authID.to_string(),
            };

            let serialized_auth_doc = mongodb::bson::to_bson(&struct_auth_doc).unwrap();
            let auth_document = serialized_auth_doc.as_document().unwrap();

            mongoose::insert_document(&client, "beezle", "Auths", auth_document.clone()).await;

            if let Some(val) = req.connection_info().realip_remote_addr() {
                beezle::mail::send(
                    &body.email,
                    "Verify your account",
                    format!(
                        "Hello {}!\nClick the URL to verify your account \"@{}\": {}\n\nDO NOT Click on the link if the account wasn't made by you!\nIP Address of the requester: {}",
                        act_handle.to_lowercase().as_str(),
                        act_handle.to_lowercase().as_str(),
                        format!("http://localhost:3000/api/verify?auth_id={}", authID).as_str(),
                        val
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
