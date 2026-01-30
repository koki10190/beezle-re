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
    mongoose::{self, add_coins, add_xp, structures::{hashtag::Hashtag, hive::HiveMember, Hive}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct _Query {
    hive_id: String,
    leave: bool
}

#[post("/api/hives/join")]
pub async fn route(
    body: web::Json<_Query>,
    client: web::Data<mongodb::Client>,
    req: HttpRequest,
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }
    
    let token_data = get_token_data(&client, &req).unwrap();

    match body.leave {
        true => {
            mongoose::delete_document(&client, "beezle", "HiveMembers", doc!{
                "part_of": &body.hive_id,
                "handle": &token_data.claims.handle
            }).await;
            return HttpResponse::Ok().json(doc!{"message": "Left the the hive successfully."});
        }
        false => {
            let doc = mongoose::get_document(&client, "beezle", "HiveMembers", doc!{
                "part_of": &body.hive_id,
                "handle": &token_data.claims.handle
            }).await;

            if let Some(_) = doc {
                return HttpResponse::Ok().json(doc!{"error": "You're already a member of this hive!"});
            }

            let hive_member = HiveMember {
                id: None,
                part_of: body.hive_id.clone(),
                handle: token_data.claims.handle.clone(),
                join_date: chrono::Utc::now(),
            };

            let bson = bson::to_bson(&hive_member).unwrap();
            let hivememdoc = bson.as_document().unwrap();

            mongoose::insert_document(&client, "beezle", "HiveMembers", hivememdoc.clone()).await;
        }
    }

    HttpResponse::Ok().json(doc!{"message": "Joined the hive successfully."})
}
