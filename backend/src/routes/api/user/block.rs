use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::Mutex};

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token, ws_send_notification},
    mongoose::{self, milestones::check_follow_milestone, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct FollowData {
    handle: String,
    block: bool,
}

#[post("/api/user/block")]
pub async fn route(
    body: web::Json<FollowData>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
    ws_sessions: web::Data<Mutex<HashMap<String, actix_ws::Session>>>
) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &get_token(&req).unwrap(),
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    let to_block =
        mongoose::get_document(&client, "beezle", "Users", doc! { "handle": &body.handle }).await;

    match to_block {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        m_doc => {
            let uw_doc = m_doc.unwrap();
            let handle = uw_doc.get("handle").unwrap().as_str().unwrap();

            if handle == token_data.handle {
                return HttpResponse::Ok().json(doc! {"error": "You cannot follow yourself dumbass!"});
            }

            if body.block {
                mongoose::delete_many_document(&client, "beezle", "BlockedUsers", doc!{
                    "who": &body.handle,
                    "by": &token_data.handle
                }).await;

                mongoose::insert_document(&client, "beezle", "BlockedUsers", doc! {
                    "who": &body.handle,
                    "by": &token_data.handle
                }).await;

                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {
                        "handle": &token_data.handle
                    },
                    doc! {
                        "$pull": {
                            "following": &body.handle
                        }
                    },
                )
                .await;

                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {
                        "handle": &body.handle
                    },
                    doc! {
                        "$pull": {
                            "following": &token_data.handle
                        }
                    },
                )
                .await;

                return HttpResponse::Ok().json(doc!{"message": "User blocked"});
            } else {
                 mongoose::delete_many_document(&client, "beezle", "BlockedUsers", doc!{
                    "who": &body.handle,
                    "by": &token_data.handle
                }).await;

                return HttpResponse::Ok().json(doc!{"message": "User unblocked"});
            }
        }
    }
}
