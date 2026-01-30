use bson::{doc, uuid, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::AggregateOptions;
use regex::Regex;
use serde::Deserialize;
use std::env;

use actix_web::{body, get, http::StatusCode, patch, delete, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, structures::{dm_msg::MESSAGE_FETCH_OFFSET, user}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    group_id: String
}

#[delete("/api/dms/leave_gc")]
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

    let gc = mongoose::get_document(&client, "beezle", "DmGroupChats",doc! {
        "group_id": &body.group_id
    }).await.unwrap();

    let arr = gc.get_array("members").unwrap();
    let first = arr.first().unwrap();
    let owner = gc.get_str("owner").unwrap();
    if owner == &token_data.handle {
        mongoose::update_document(
            &client,
            "beezle",
            "DmGroupChats",
            doc! {
                "group_id": &body.group_id,
                "owner": &token_data.handle,
            },
            doc! {
                "$set": {
                    "owner": first.as_str().unwrap()
                }
            },
        ).await;
    }

    mongoose::update_document(
        &client,
        "beezle",
        "DmGroupChats",
        doc! {
            "group_id": &body.group_id
        },
        doc! {
            "$pull": {
                "members": &token_data.handle
            }
        },
    ).await;

    mongoose::delete_document(&client, "beezle", "DmSelections", doc! {
        "belongs_to": &token_data.handle,
        "group_id": &body.group_id
    }).await;
    
    HttpResponse::Ok().json(doc! {
        "message": "Done!",
    })
}
