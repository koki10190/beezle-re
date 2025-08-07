use anyhow::Ok;
use bson::{doc, uuid, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mongodb::options::FindOptions;
use regex::Regex;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::{Arc, Mutex}};

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::{get_token, get_token_data, verify_token}, mongo, user_exists, ws_send_notification},
    mongoose::{self, add_coins, add_xp, structures::{hashtag::Hashtag, Hive}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct _Query {
    handle: String,
}

#[get("/api/hives/get")]
pub async fn route(
    body: web::Query<_Query>,
    client: web::Data<mongodb::Client>,
    req: HttpRequest,
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }
    
    let doc = mongoose::get_document(&client, "beezle", "Hives", doc!{
        "$or": [
            doc! {
                "handle":  mongodb::bson::Regex {
                    pattern: body.handle.replace("@", "").to_string(),
                    options: "i".to_string()
                }
            },
            doc! {
                "hive_id": &body.handle
            },
        ]
    }).await.unwrap();

    let hive_count = mongoose::get_count(&client, "beezle", "HiveMembers", doc!{
        "part_of": doc.get("hive_id").unwrap().as_str().unwrap()
    }).await;

    HttpResponse::Ok().json(doc!{"hive": doc, "members": hive_count as i64})
}
