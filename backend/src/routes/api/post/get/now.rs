use bson::{bson, doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    mongoose::{self, get_many::vec_to_str, structures::user},
};

#[get("/api/post/get/now")]
pub async fn route(client: web::Data<mongodb::Client>) -> impl Responder {
    //TODO: do this

    let mut many = mongoose::get_many::get_many_document(&client, "beezle", "Posts", doc! {}).await;
    many.reverse();

    HttpResponse::Ok().json(many)
}
