use bson::{doc, Document};
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
    post_id: String,
}

#[get("/api/post/get/one")]
pub async fn route(
    body: web::Query<GetUserPublicQuery>,
    client: web::Data<mongodb::Client>,
    req: HttpRequest,
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    let auth_doc = mongoose::get_document(
        &client,
        "beezle",
        "Posts",
        doc! { "post_id": &body.post_id },
    )
    .await;

    let reactions = mongoose::get_many_document(&client, "beezle", "Reactions", doc!{
        "post_id": &body.post_id
    }).await;

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

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        Some(mut _document) => {
            _document.insert("post_reactions", reactions);
            _document.insert("reply_count", count);
            HttpResponse::Ok().json(_document)
        },
    }
}
