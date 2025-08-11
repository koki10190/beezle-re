use bson::{de::Error, doc, Array, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::{Arc, Mutex}};

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::verify_token, is_user_online},
    mongoose::{self, structures::user},
    poison::LockResultExt, routes::api::connections::steam_get_game::get_steam_playing_now,
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
            _document.remove("hash_password");
            _document.remove("notifications");
            _document.remove("bookmarks");
            
            let connections = _document.get_mut("connections");

            if let Some(con) = connections {
                let doc = con.as_document_mut().expect("Moron");
                let empty_doc = doc! {};

                let discord = doc.get_mut("discord");
                if let Some(d) = discord {
                    d.as_document_mut().expect("no doc").remove("access_token");
                    d.as_document_mut().expect("no doc").remove("refresh_token");
                }

                let spotify = doc.get_mut("spotify");
                if let Some(d) = spotify {
                    d.as_document_mut().expect("no doc").remove("access_token");
                    d.as_document_mut().expect("no doc").remove("refresh_token");
                }
            }

            let status = is_user_online(&ws_sessions, &body.handle);
            let cloned = _document.clone();
            let status_string = cloned.get("status").unwrap_or(&bson::Bson::Null).as_str().unwrap_or("online");
            _document.insert("status", if status {status_string} else {"offline"});
            _document.insert("status_db", status_string);

            HttpResponse::Ok().json(_document)
        },
    }
}
