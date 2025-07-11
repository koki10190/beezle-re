use bson::{bson, doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    mongoose::{self, get_many::vec_to_str, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetRepliesQuery {
    post_id: String,
}

#[get("/api/post/get/reply_count")]
pub async fn route(
    body: web::Query<GetRepliesQuery>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let count = mongoose::get_count(
        &client,
        "beezle",
        "Posts",
        doc! {
            "replying_to": &body.post_id,
            "repost": false
        },
    )
    .await as i64;

    HttpResponse::Ok().json(doc! {
        "count": count
    })
}
