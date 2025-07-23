use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use serde::Deserialize;
use std::{collections::HashMap, env, sync::Mutex};

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{beezle::{mongo::add_post_notif, send_socket_to_user, ws_send_notification}, mongoose::{self, structures::post}};

#[derive(Deserialize)]
struct TokenInfo {
    token: String,
    post_id: String,
    remove_like: bool,
}

#[post("/api/post/like")]
pub async fn route(
    body: web::Json<TokenInfo>,
    client: web::Data<mongodb::Client>,
    ws_sessions: web::Data<Mutex<HashMap<String, actix_ws::Session>>>
) -> impl Responder {
    let token = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    );

    match token {
        Ok(_) => {
            let data = token.unwrap();

            let post_doc = mongoose::get_document(
                &client,
                "beezle",
                "Posts",
                doc! {
                    "post_id": &body.post_id
                },
            )
            .await;

            let post_unwrapped = post_doc.unwrap();
            let post_op = post_unwrapped.get("handle").unwrap().as_str().unwrap().to_string();

            if body.remove_like {
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Posts",
                    doc! {"post_id": &body.post_id},
                    doc! {
                        "$pull": {
                            "likes": &data.claims.handle
                        }
                    },
                )
                .await;

                mongoose::add_coins(&client, data.claims.handle.as_str(), -20).await;
                if post_op != data.claims.handle {
                    mongoose::add_coins(&client, post_op.as_str(), -25).await;                    
                }
            } else {
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Posts",
                    doc! {"post_id": &body.post_id},
                    doc! {
                        "$addToSet": {
                            "likes": &data.claims.handle
                        }
                    },
                )
                .await;
                mongoose::add_coins(&client, data.claims.handle.as_str(), 20).await;
                mongoose::add_xp(&client, &data.claims.handle.as_str(), 15).await;

                if post_op != data.claims.handle {
                    mongoose::add_coins(&client, post_op.as_str(), 25).await;                    
                    mongoose::add_xp(&client, &data.claims.handle.as_str(), 25).await;
                }

                if post_op != data.claims.handle {
                    mongoose::update_document(
                        &client,
                        "beezle",
                        "Users",
                        doc! {
                            "handle": &post_op
                        },
                        doc! {
                            "$addToSet": {
                                "notifications": {
                                    "caller": &data.claims.handle,
                                    "post_id": &body.post_id,
                                    "message": "liked your message!"
                                }
                            }
                        },
                    )
                    .await;

                    ws_send_notification(ws_sessions.clone(), &post_op).await;
                }
            }

            return HttpResponse::Ok().json(
                mongoose::get_document(&client, "beezle", "Posts", doc! {"post_id": &body.post_id})
                    .await,
            );
        }
        Err(_) => HttpResponse::Ok().json(doc! {"error": "Couldn't decode token"}),
    }
}
