use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{beezle::{self, auth::{check_if_blocked, get_token}}, mongoose::{self, milestones::check_repost_milestone}, poison::LockResultExt};

#[derive(Deserialize)]
struct TokenInfo {
    post_id: String,
    remove_repost: bool,
}

#[post("/api/post/repost")]
pub async fn route(
    body: web::Json<TokenInfo>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token = decode::<mongoose::structures::user::JwtUser>(
        &get_token(&req).unwrap(),
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    );

    match token {
        Ok(data) => {
            let post_doc = mongoose::get_document(
                &client,
                "beezle",
                "Posts",
                doc! {
                    "post_id": &body.post_id
                },
            )
            .await
            .unwrap();

            let post_doc_repost_check = mongoose::get_document(
                &client,
                "beezle",
                "Posts",
                doc! {
                    "post_op_id": &body.post_id,
                    "handle": &data.claims.handle,
                    "repost": true
                },
            )
            .await;

            if post_doc.get("repost").unwrap().as_bool().unwrap() {
                return HttpResponse::Ok().json(doc! {"error": "Cannot repost a repost"});
            }

            let is_block = check_if_blocked(&client, &data.claims.handle, &post_doc.get("handle").unwrap().as_str().unwrap().to_string()).await;

            if is_block {
                return HttpResponse::Ok().json(doc! {"error": "You're blocked!"});
            }

            if body.remove_repost {
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Posts",
                    doc! {"post_id": &body.post_id},
                    doc! {
                        "$pull": {
                            "reposts": &data.claims.handle
                        }
                    },
                )
                .await;

                mongoose::delete_many_document(
                    &client,
                    "beezle",
                    "Posts",
                    doc! {
                        "post_op_id": &body.post_id,
                        "handle": &data.claims.handle,
                    },
                )
                .await;

                mongoose::add_coins(&client, data.claims.handle.as_str(), -25).await;
            } else {
                if let Some(_) = post_doc_repost_check {
                    return HttpResponse::BadRequest().json(doc!{"error": "Post is already reposted!"});
                } 
                
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Posts",
                    doc! {"post_id": &body.post_id},
                    doc! {
                        "$addToSet": {
                            "reposts": &data.claims.handle
                        }
                    },
                )
                .await;

                let original_post_doc = mongoose::get_document(
                    &client,
                    "beezle",
                    "Posts",
                    doc! {
                        "post_id": &body.post_id
                    },
                )
                .await
                .unwrap();

                let struct_post_doc = mongoose::structures::post::Repost {
                    id: None,
                    handle: data.claims.handle.to_string(),
                    content: beezle::rem_first_and_last(
                        &original_post_doc.get("content").unwrap().to_string(),
                    )
                    .to_string(),
                    creation_date: original_post_doc.get("creation_date").unwrap().as_datetime().unwrap().to_chrono(),
                    repost: true,
                    likes: vec![],
                    reposts: vec![],
                    edited: original_post_doc.get("edited").unwrap().as_bool().unwrap(),
                    post_id: uuid::Uuid::new().to_string(),
                    post_op_id: beezle::rem_first_and_last(
                        &original_post_doc.get("post_id").unwrap().to_string(),
                    )
                    .to_string(),
                    post_op_handle: beezle::rem_first_and_last(
                        &original_post_doc.get("handle").unwrap().to_string(),
                    )
                    .to_string(),
                    replying_to: original_post_doc
                        .get("replying_to")
                        .unwrap()
                        .as_str()
                        .unwrap()
                        .to_string(),
                    is_reply: original_post_doc
                        .get("is_reply")
                        .unwrap()
                        .as_bool()
                        .unwrap(),
                };

                let serialized_post_doc = mongodb::bson::to_bson(&struct_post_doc).unwrap();
                let document = serialized_post_doc.as_document().unwrap();

                mongoose::insert_document(&client, "beezle", "Posts", document.clone()).await;
                mongoose::add_coins(&client, data.claims.handle.as_str(), 25).await;
                mongoose::add_xp(&client, &data.claims.handle, 15).await;
                check_repost_milestone(&client, &original_post_doc.get("handle").unwrap().as_str().unwrap(), post_doc.get("reposts").unwrap().as_array().unwrap().len() as i64 + 1).await;
            }

            return HttpResponse::Ok().json(
                mongoose::get_document(&client, "beezle", "Posts", doc! {"post_id": &body.post_id})
                    .await,
            );
        }
        Err(_) => HttpResponse::Ok().json(doc! {"error": "Couldn't decode token"}),
    }
}
