use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::{Arc, Mutex}};

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token, ws_send_notification},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct FollowData {
    handle: String,
    add: bool
}

#[post("/api/user/add_notif")]
pub async fn route(
    body: web::Json<FollowData>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
    ws_sessions: web::Data<Arc<Mutex<HashMap<String, actix_ws::Session>>>>
) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &get_token(&req).unwrap(),
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    let to_follow =
        mongoose::get_document(&client, "beezle", "Users", doc! { "handle": &body.handle }).await;

    match to_follow {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        m_doc => {
            let uw_doc = m_doc.unwrap();
            let handle = uw_doc.get("handle").unwrap().as_str().unwrap();

            if body.add {
                // MODIFY THE REQUESTER
                if token_data.handle == handle {
                    return HttpResponse::Ok().json(doc!{"error": "You cannot add a notification for yourself."})
                }
                
                let struct_notif = mongoose::structures::user_notif::UserNotif {
                    id: None,
                    notif_from: body.handle.clone(),
                    notif_to: token_data.handle.clone()
                };

                let serialized_post_doc = mongodb::bson::to_bson(&struct_notif).unwrap();
                let document = serialized_post_doc.as_document().unwrap();

                mongoose::insert_document(&client, "beezle", "UserNotifs", document.clone()).await;

                // MODIFY THE GUY WE'RE GONNA FOLLOW
            } else {
                mongoose::delete_document(&client, "beezle", "UserNotifs", doc! {
                    "notif_from": &body.handle,
                    "notif_to": &token_data.handle
                }).await;
            }

            HttpResponse::Ok().json(doc!{"message": "Success!"})
        }
    }
}
