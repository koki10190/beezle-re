use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::Mutex};

use actix_web::{cookie::time::util::days_in_year, get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, ws_send_notification},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct FollowData {
    token: String,
    handle: String,
}

#[post("/api/user/check_has_notif")]
pub async fn route(
    body: web::Json<FollowData>,
    client: web::Data<mongodb::Client>,
    ws_sessions: web::Data<Mutex<HashMap<String, actix_ws::Session>>>
) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    println!("'{}'.'{}'", body.handle, token_data.handle);
    let has_noti = mongoose::get_document(&client, "beezle", "UserNotifs", doc! { "notif_from": &body.handle, "notif_to": &token_data.handle }).await;
    if let Some(noti) = has_noti {
        return HttpResponse::Ok().json(doc!{"has": true});
    }

    HttpResponse::Ok().json(doc!{"has": false, "error": "Couldn't match, probably some error."})
}
