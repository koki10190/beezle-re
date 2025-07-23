use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::Client;
use serde::Deserialize;
use std::{env, ops::Deref, path};

use actix_web::{delete, get, http::StatusCode, patch, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    data_struct::AppData,
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct ClearNotifQuery {
    token: String,
}

#[patch("/api/user/clear_notifs")]
pub async fn route(body: web::Json<ClearNotifQuery>, client: web::Data<Client>) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    let user_doc = mongoose::get_document(
        &client,
        "beezle",
        "Users",
        doc! { "handle": &token_data.handle, "hash_password": &token_data.hash_password },
    )
    .await;

    match user_doc {
        None => HttpResponse::Ok().json(doc! {"changed": false, "error": "User not found!"}),
        _document => {
            mongoose::update_document(
                &client,
                "beezle",
                "Users",
                doc! {
                    "handle": &token_data.handle,
                },
                doc! {
                    "$set": {
                        "notifications": []
                    }
                },
            )
            .await;

            HttpResponse::Ok().json(doc! {"changed": true})
        }
    }
}
