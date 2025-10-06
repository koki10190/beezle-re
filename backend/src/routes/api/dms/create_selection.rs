use bson::{doc, uuid, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::AggregateOptions;
use regex::Regex;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, patch, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, structures::{dm_msg::MESSAGE_FETCH_OFFSET, user}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    is_group: bool,
    user_handle: Option<String>,
}

#[post("/api/dms/create_selection")]
pub async fn route(
    body: web::Json<GetUserQuery>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token = get_token(&req).unwrap();
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    let handle = body.user_handle.clone().unwrap_or("".to_string());
    let id = uuid::Uuid::new().to_string();
    mongoose::insert_document(&client, "beezle", "DmSelections", doc! {
        "is_group": body.is_group,
        "user_handle": handle,
        "belongs_to": &token_data.handle,
        "selection_id": id.clone()
    }).await;
    
    HttpResponse::Ok().json(doc! {
        "message": "Done!",
        "id": id.clone()
    })
}
