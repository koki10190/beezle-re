use bson::{doc, Array, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::{Arc, Mutex}};

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::verify_token, is_user_online},
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
    req: HttpRequest,
    ws_sessions: web::Data<Arc<Mutex<HashMap<String, actix_ws::Session>>>>
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    let auth_doc =
        mongoose::get_document(&client, "beezle", "Users", doc! { "handle": &body.handle }).await;

    let empty: Array = [].to_vec();

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        Some(mut _document) => {
            _document.remove("email");
            _document.remove("password");
            
            let status = is_user_online(&ws_sessions, &body.handle);
            let cloned = _document.clone();
            let status_string = cloned.get("status").unwrap_or(&bson::Bson::Null).as_str().unwrap_or("online");
            _document.insert("status", if status {status_string} else {"offline"});

            HttpResponse::Ok().json(_document)
        },
    }
}
