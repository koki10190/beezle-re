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

#[derive(Deserialize)]
struct GetRepliesQuery {
    post_id: String,
}

#[get("/api/post/get/reply_count")]
pub async fn route(
    body: web::Query<GetRepliesQuery>,
    app: web::Data<std::sync::Mutex<crate::data_struct::AppData>>,
) -> impl Responder {
    let mut app_data = app.lock().unwrap();
    //TODO: do this

    let count = mongoose::get_count(
        &app_data.client,
        "beezle",
        "Posts",
        doc! {
            "replying_to": &body.post_id
        },
    )
    .await as i64;

    HttpResponse::Ok().json(doc! {
        "count": count
    })
}
