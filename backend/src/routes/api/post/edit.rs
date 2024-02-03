use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    mongoose::{self, structures::user},
};

#[derive(Deserialize)]
struct PostEditData {
    post_id: String,
    token: String,
    content: String,
}

#[post("/api/post/edit")]
pub async fn route(
    client: web::Data<mongodb::Client>,
    body: web::Json<PostEditData>,
) -> impl Responder {
    let token = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    );

    if body.content == "" {
        return HttpResponse::Ok().json(doc! {"error": "Edit content cannot be null!"});
    }

    match token {
        Ok(_) => {
            let data = token.unwrap();

            mongoose::update_document(
                &client,
                "beezle",
                "Posts",
                doc! {
                    "handle": &data.claims.handle,
                    "post_id": &body.post_id,
                    "repost": false
                },
                doc! {
                    "$set": {
                        "content": &body.content,
                        "edited": true
                    }
                },
            )
            .await;

            return HttpResponse::Ok().json(
                mongoose::get_document(&client, "beezle", "Posts", doc! {"post_id": &body.post_id})
                    .await,
            );
        }
        Err(_) => HttpResponse::Ok().json(doc! {"error": "Couldn't decode token"}),
    }
}
