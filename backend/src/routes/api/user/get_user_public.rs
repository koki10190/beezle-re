use bson::{doc, Array, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::verify_token},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserPublicQuery {
    handle: String,
}

#[get("/api/user")]
pub async fn route(
    body: web::Query<GetUserPublicQuery>,
    client: web::Data<mongodb::Client>,
    req: HttpRequest
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    let auth_doc =
        mongoose::get_document(&client, "beezle", "Users", doc! { "handle": &body.handle }).await;

    let empty: Array = [].to_vec();

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        _document => {
            HttpResponse::Ok().json(doc! {
            "handle": _document.clone().unwrap().get("handle").unwrap().as_str().unwrap(),
            "username": _document.clone().unwrap().get("username").unwrap().as_str().unwrap(),
            "verified": _document.clone().unwrap().get("verified").unwrap().as_bool().unwrap(),
            "avatar": _document.clone().unwrap().get("avatar").unwrap().as_str().unwrap(),
            "banner": _document.clone().unwrap().get("banner").unwrap().as_str().unwrap(),
            "about_me": _document.clone().unwrap().get("about_me").unwrap().as_str().unwrap(),
            "creation_date": _document.clone().unwrap().get("creation_date").unwrap().as_datetime(),
            "badges":  _document.clone().unwrap().get("badges").unwrap().as_array().unwrap().to_vec(),
            "followers":  _document.clone().unwrap().get("followers").unwrap().as_array().unwrap().to_vec(),
            "following":  _document.clone().unwrap().get("following").unwrap().as_array().unwrap().to_vec(),
            "coins":  _document.clone().unwrap().get("coins").unwrap().as_i64().unwrap(),
            "reputation":  _document.clone().unwrap().get("reputation").unwrap().as_i64().unwrap(),
            "levels":  _document.clone().unwrap().get("levels").unwrap(),
            "activity":  _document.clone().unwrap().get("activity").unwrap().as_str().unwrap(),
            "pinned_post":  _document.clone().unwrap().get("pinned_post").unwrap().as_str().unwrap(),
            "customization":  _document.clone().unwrap().get("customization").unwrap().as_document().unwrap(),
            "connections":  _document.clone().unwrap().get("connections").unwrap().as_document().unwrap(),
            "is_bot":  _document.clone().unwrap_or_else(|| {
                println!("Couldn't unwrap doc for some reason");
                return doc!{}
            }).get("is_bot").unwrap_or_else(|| {
                println!("Milestones not found?");
                return &bson::Bson::Null
            }).as_bool().unwrap_or_else(|| {
                println!("Couldnt unwrap as array");
                return false
            }),
            "milestones":  _document.clone().unwrap_or_else(|| {
                println!("Couldn't unwrap doc for some reason");
                return doc!{}
            }).get("milestones").unwrap_or_else(|| {
                println!("Milestones not found?");
                return &bson::Bson::Null
            }).as_array().unwrap_or_else(|| {
                println!("Couldnt unwrap as array");
                return &empty
            })
        }) },
    }
}
