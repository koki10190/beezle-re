use bson::{bson, doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::verify_token},
    mongoose::{self, get_many::vec_to_str, structures::user},
    poison::LockResultExt,
};

#[get("/api/user/many")]
pub async fn route(client: web::Data<mongodb::Client>, req: HttpRequest) -> impl Responder {
    //TODO: do this
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    let mut many = mongoose::get_many_document(&client, "beezle", "Users", doc! {}).await;

    HttpResponse::Ok().json(many)
}
