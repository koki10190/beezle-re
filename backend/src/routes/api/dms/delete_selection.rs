use bson::{doc, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::AggregateOptions;
use regex::Regex;
use serde::Deserialize;
use std::{any::Any, env};

use actix_web::{get, http::StatusCode, patch, post, delete, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, structures::{dm_msg::MESSAGE_FETCH_OFFSET, user}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    selection_id: String 
}

#[delete("/api/dms/delete_selection")]
pub async fn route(
    body: web::Query<GetUserQuery>,
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

    mongoose::delete_document(&client, "beezle", "DmSelections", doc! {
        "belongs_to": &token_data.handle,
        "selection_id": &body.selection_id
    }).await;
    
    HttpResponse::Ok().json(doc! {
        "message": "Done!"
    })
}
