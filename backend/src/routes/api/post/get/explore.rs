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

#[get("/api/post/get/explore")]
pub async fn route(
    app: web::Data<std::sync::Mutex<crate::data_struct::AppData>>,
) -> impl Responder {
    let mut app_data = app.lock().unwrap();
    //TODO: do this

    let many =
        mongoose::get_many::get_many_random_document(&app_data.client, "beezle", "Posts", doc! {})
            .await;

    HttpResponse::Ok().json(many)
}
