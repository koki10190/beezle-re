use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{beezle, mongoose};

#[derive(Deserialize)]
struct TokenInfo {
    token: String,
    content: String,
}

#[post("/api/post/create")]
pub async fn route(
    client: web::Data<mongodb::Client>,
    body: web::Json<TokenInfo>,
) -> impl Responder {
    let token = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    );

    match token {
        Ok(_) => {
            let data = token.unwrap();

            let struct_post_doc = mongoose::structures::post::Post {
                id: None,
                handle: data.claims.handle,
                content: body.content.to_string(),
                creation_date: chrono::Utc::now(),
                repost: false,
                likes: vec![],
                reposts: vec![],
                post_id: uuid::Uuid::new().to_string(),
            };

            let serialized_post_doc = mongodb::bson::to_bson(&struct_post_doc).unwrap();
            let document = serialized_post_doc.as_document().unwrap();

            mongoose::insert_document(&client, "beezle", "Posts", document.clone()).await;

            HttpResponse::Ok().json(document)
        }
        Err(_) => HttpResponse::Ok().json(doc! {"error": "Couldn't decode token"}),
    }
}
