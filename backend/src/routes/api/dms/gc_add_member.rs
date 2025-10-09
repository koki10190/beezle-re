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
    handle: String,
    group_id: String
}

#[patch("/api/dms/gc_add_member")]
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

    let validation = mongoose::get_document(&client, "beezle", "Users", doc!{
        "handle": &body.handle,
        "following": &token_data.handle
    }).await;

    match validation {
        Some(doc) => {
            mongoose::update_document(&client, "beezle", "DmGroupChats", doc!{
                "owner": &token_data.handle,
                "group_id": &body.group_id
            }, doc! {
                "$addToSet": {
                    "members": &body.handle,
                }
            }).await;

            let duplicate = mongoose::get_document(&client, "beezle", "DmSelections", doc! {
                "is_group": true,
                "group_id": &body.group_id,
                "belongs_to": &body.handle,
            }).await;

            if duplicate.is_none() {
                mongoose::insert_document(&client, "beezle", "DmSelections", doc! {
                    "is_group": true,
                    "group_id": &body.group_id,
                    "belongs_to": &body.handle,
                    "selection_id": uuid::Uuid::new()
                }).await;
            }

            return HttpResponse::Ok().json(doc! {
                "message": "Member added successfully",
                "group_id": &body.group_id,
            })
        }   
        None => HttpResponse::Ok().json(doc! {
            "error": "Not mutuals with this person"
        })
    }
}
