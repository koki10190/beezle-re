use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{beezle, mongoose, poison::LockResultExt};

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
            }

            return HttpResponse::Ok().json(
                mongoose::get_document(&client, "beezle", "Posts", doc! {"post_id": &body.post_id})
                    .await,
            );
        }
        Err(_) => HttpResponse::Ok().json(doc! {"error": "Couldn't decode token"}),
    }
}
