use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::Mutex};

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, ws_send_notification},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct FollowData {
    token: String,
    handle: String,
    follow: bool,
}

#[post("/api/user/follow")]
pub async fn route(
    body: web::Json<FollowData>,
    client: web::Data<mongodb::Client>,
    ws_sessions: web::Data<Mutex<HashMap<String, actix_ws::Session>>>
) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    let to_follow =
        mongoose::get_document(&client, "beezle", "Users", doc! { "handle": &body.handle }).await;

    match to_follow {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        m_doc => {
            let uw_doc = m_doc.unwrap();
            let handle = uw_doc.get("handle").unwrap().as_str().unwrap();

            if body.follow {
                // MODIFY THE REQUESTER
                if token_data.handle == handle {
                    return HttpResponse::Ok().json(doc!{"error": "You cannot follow yourself."})
                }
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {
                        "handle": &token_data.handle
                    },
                    doc! {
                        "$addToSet": {
                            "following": handle
                        }
                    },
                )
                .await;

                // MODIFY THE GUY WE'RE GONNA FOLLOW
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {
                        "handle": handle
                    },
                    doc! {
                        "$addToSet": {
                            "followers": &token_data.handle,
                            "notifications": {
                                "caller": &token_data.handle,
                                "handle": &token_data.handle,
                                "message": "followed you!"
                            }
                        }
                    },
                )
                .await;

                ws_send_notification(ws_sessions.clone(), &handle).await;

                mongoose::add_coins(&client, token_data.handle.as_str(), 20).await;
                mongoose::add_xp(&client, token_data.handle.as_str(), 20).await;
            } else {
                // MODIFY THE REQUESTER
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {
                        "handle": &token_data.handle
                    },
                    doc! {
                        "$pull": {
                            "following": handle
                        }
                    },
                )
                .await;

                // MODIFY THE GUY WE'RE UNFOLLOWING
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {
                        "handle": handle
                    },
                    doc! {
                        "$pull": {
                            "followers": &token_data.handle
                        }
                    },
                )
                .await;

                mongoose::add_coins(&client, token_data.handle.as_str(), -20).await;
            }

            HttpResponse::Ok().json(uw_doc)
        }
    }
}
