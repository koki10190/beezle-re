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
    handle: String,
}

#[get("/api/get_user")]
pub async fn route(
    client: web::Data<mongodb::Client>,
    body: web::Query<GetUserPublicQuery>,
) -> impl Responder {
    let auth_doc =
        mongoose::get_document(&client, "beezle", "Users", doc! { "handle": &body.handle }).await;

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        _document => {
            HttpResponse::Ok().json(doc! {
            "handle": beezle::rem_first_and_last(&_document.clone().unwrap().get("handle").unwrap().to_string()),
            "username": beezle::rem_first_and_last(&_document.clone().unwrap().get("username").unwrap().to_string()),
            "verified": beezle::rem_first_and_last(&_document.clone().unwrap().get("verified").unwrap().to_string()),
            "avatar": beezle::rem_first_and_last(&_document.clone().unwrap().get("avatar").unwrap().to_string()),
            "banner": beezle::rem_first_and_last(&_document.clone().unwrap().get("banner").unwrap().to_string()),
            "about_me": beezle::rem_first_and_last(&_document.clone().unwrap().get("about_me").unwrap().to_string()),
            "creation_date": _document.clone().unwrap().get("creation_date").unwrap().as_datetime(),
            "badges":  _document.clone().unwrap().get("badges").unwrap().as_array().unwrap().to_vec()
        }) },
    }
}
