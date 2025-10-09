use bson::{doc, uuid, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::AggregateOptions;
use regex::Regex;
use serde::Deserialize;
use std::env;

use actix_web::{body, get, http::StatusCode, patch, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, structures::{dm_msg::MESSAGE_FETCH_OFFSET, user}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    avatar: String,
    name: String,
    group_id: String
}

#[patch("/api/dms/edit_gc")]
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

    let regex = Regex::new(r"\b^https?:\/\/i\.imgur\.com\S+").unwrap();
    if !regex.is_match(&body.avatar) {
        return HttpResponse::Ok().json(doc! {"error": "Only Imgur links are allowed for safety reasons! You dirty ass fucking hacker, eat shit faggot"});
    }

    mongoose::update_document(&client, "beezle", "DmGroupChats", doc!{
        "owner": &token_data.handle,
        "group_id": &body.group_id
    }, doc! {
        "$set": {
            "avatar": &body.avatar,
            "name": &body.name
        }
    }).await;

    HttpResponse::Ok().json(doc! {
        "message": "Group chat edited successfully",
        "group_id": &body.group_id,
    })
}
