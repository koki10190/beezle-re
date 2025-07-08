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

#[get("/api/post/get/reacts")]
pub async fn route(
    body: web::Query<GetRepliesQuery>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    //TODO: do this

    beezle::print(format!("Getting reacts {}", body.post_id).as_str());
    let mut many = mongoose::get_many::get_many_document(
        &client,
        "beezle",
        "Reactions",
        doc! {
            "post_id": &body.post_id
        },
    )
    .await;
    many.reverse();

    let count = many.len() as i64;

    HttpResponse::Ok().json(doc! {
        "reacts": many,
        "count": count
    })
}
