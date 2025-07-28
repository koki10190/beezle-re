use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::Mutex};

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::{check_if_blocked, get_token, get_token_data, verify_token}, ws_send_notification},
    mongoose::{self, milestones::check_follow_milestone, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct FollowData {
    who: String,
    by: String
}

#[get("/api/user/is_blocked")]
pub async fn route(
    body: web::Query<FollowData>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!", "is_blocked": false});
    }

    let is_blocked = check_if_blocked(&client, &body.who, &body.by).await;

    HttpResponse::Ok().json(doc!{"is_blocked": is_blocked})
}
