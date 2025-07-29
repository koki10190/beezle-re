use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::Predicate;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::Mutex};

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token, is_user_online},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
}

#[get("/api/user/private")]
pub async fn route(
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
    ws_sessions: web::Data<Mutex<HashMap<String, actix_ws::Session>>>
) -> impl Responder {
    let token = get_token(&req).unwrap(); 
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    let auth_doc = mongoose::get_document(
        &client,
        "beezle",
        "Users",
        doc! { "handle": &token_data.handle, "hash_password": &token_data.hash_password },
    )
    .await;


    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        Some(mut _document) => {
            let status = is_user_online(ws_sessions, &token_data.handle);
            let cloned = _document.clone();
            let status_string = cloned.get("status").unwrap_or(&bson::Bson::Null).as_str().unwrap_or("online");
            _document.insert("status", if status {status_string} else {"offline"});

            HttpResponse::Ok().json(_document)
        },
    }
}
