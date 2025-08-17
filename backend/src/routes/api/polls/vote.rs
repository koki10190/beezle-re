use bson::{bson, doc, Document};
use chrono::Utc;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, patch, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::{get_token_data, verify_token}},
    mongoose::{self, get_many::vec_to_str, structures::{poll::{Poll, PollVoter}, user}},
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
    poll_id: String,
    value: String
}

#[patch("/api/polls/vote")]
pub async fn route(
    body: web::Json<Query>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    let token_data = get_token_data(&client, &req).unwrap().claims;

    let _p = mongoose::get_document(&client, "beezle", "Polls", doc!{
        "poll_id": &body.poll_id
    }).await;

    let voted_check = mongoose::get_document(&client, "beezle", "PollVoters", doc!{
        "poll_id": &body.poll_id,
        "handle": &token_data.handle
    }).await;

    if voted_check.is_some() {
        return HttpResponse::Ok().json(doc!{"error": "You already voted!"});
    }

    if _p.is_none() {
        return HttpResponse::NotFound().json(doc!{"error": "Poll not found!"});
    }

    let poll: Poll = bson::from_bson(bson::Bson::Document(_p.unwrap().clone())).unwrap();

    if Utc::now().timestamp() >= poll.expiry_date.timestamp() {
        return HttpResponse::Ok().json(doc!{"error": "Poll is expired!"});
    }
    
    

    let poll_voter_struct = PollVoter {
        id: None,
        poll_id: poll.poll_id.clone(),
        handle: token_data.handle.clone(),
        value: body.value.clone()
    };

    let serialized_doc = mongodb::bson::to_bson(&poll_voter_struct).unwrap();
    let document = serialized_doc.as_document().unwrap();
    mongoose::insert_document(&client, "beezle", "PollVoters", document.clone()).await;

    HttpResponse::Ok().json(poll_voter_struct)
}
