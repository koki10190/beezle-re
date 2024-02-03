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
struct GetUserPublicQuery {
    post_id: String,
}

#[get("/api/post/get/one")]
pub async fn route(
    client: web::Data<mongodb::Client>,
    body: web::Query<GetUserPublicQuery>,
) -> impl Responder {
    let auth_doc = mongoose::get_document(
        &client,
        "beezle",
        "Posts",
        doc! { "post_id": &body.post_id },
    )
    .await;

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        _document => HttpResponse::Ok().json(_document),
    }
}
