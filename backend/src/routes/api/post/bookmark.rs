use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{beezle::{self, auth::get_token}, mongoose, poison::LockResultExt};

#[derive(Deserialize)]
struct TokenInfo {
    post_id: String,
    remove_bookmark: bool,
}

#[post("/api/post/bookmark")]
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
        Ok(_) => {
            let data = token.unwrap();

            if body.remove_bookmark {
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {"handle": &data.claims.handle},
                    doc! {
                        "$pull": {
                            "bookmarks": &body.post_id
                        }
                    },
                )
                .await;
            } else {
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {"handle": &data.claims.handle},
                    doc! {
                        "$addToSet": {
                            "bookmarks": &body.post_id
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
