use bson::{doc, Document};
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

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

            HttpResponse::Ok().json(doc)
        }
        Document => HttpResponse::Ok()
            .json(doc! { "error": "User with the same email and/or handle exists!" }),
    }
}
