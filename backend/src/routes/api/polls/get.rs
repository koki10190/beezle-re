use bson::{bson, doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::{get_token_data, verify_token}},
    mongoose::{self, get_many::vec_to_str, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct ProfileImage {
    image: String,
    repeat: bool,
    enabled: bool,
    size: String,
}

#[derive(Deserialize)]
struct Query {
    poll_id: String
}
#[get("/api/polls/get")]
pub async fn route(
    body: web::Query<Query>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    // let token_data = get_token_data(&client, &req).unwrap().claims;

    let poll = mongoose::get_document(&client, "beezle", "Polls", doc!{
        "poll_id": &body.poll_id
    }).await;

    match poll {
        Some(mut poll) => {
            let voters_doc = mongoose::get_many_document(&client, "beezle", "PollVoters", doc!{
                "poll_id": &body.poll_id
            }).await;
            poll.insert("voters", voters_doc);
            
            HttpResponse::Ok().json(poll)
        },
        None => HttpResponse::NotFound().json(doc!{"error": "Poll not found!"})
    }
}
