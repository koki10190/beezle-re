use bson::{doc, Array, Document};
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
            _document.remove("password");
            _document.remove("notifications");
            
            let status = is_user_online(&ws_sessions, &body.handle);
            let cloned = _document.clone();
            let status_string = cloned.get("status").unwrap_or(&bson::Bson::Null).as_str().unwrap_or("online");
            _document.insert("status", if status {status_string} else {"offline"});
            _document.insert("status_db", status_string);

            let connections = _document.get("connections");
            match connections {
                Some(cons) => {
                    let con_doc = cons.as_document().unwrap();
                    let steam_con = con_doc.get("steam");

                    if let Some(steam) = steam_con {
                        let id = steam.as_document().unwrap().get("id").unwrap().as_str().unwrap();
                        let game_data = get_steam_playing_now(id).await;

                        match game_data {
                            Ok(game) => {
                                _document.insert("steam_data", game);
                            }
                            Err(err) => {
                                println!("{:?}", err);
                            }
                        }
                    }
                }
                None => {
                    beezle::print("Null!");
                }
            }

            HttpResponse::Ok().json(_document)
        },
    }
}
