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

#[get("/api/hives/get/joined_hives")]
pub async fn route(
    client: web::Data<mongodb::Client>,
    req: HttpRequest,
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }
    
    let token_data = get_token_data(&client, &req).unwrap();

    let hive_ids: Vec<Document> = mongoose::get_many_document(&client, "beezle", "HiveMembers", doc!{
        "handle": &token_data.claims.handle
    }).await;

    let mut hives: Vec<Document> = vec![];

    for hive_member in hive_ids {
        let hive = mongoose::get_document(&client, "beezle", "Hives", doc!{
            "hive_id": hive_member.get("part_of").unwrap().as_str().unwrap() 
        }).await.unwrap();

        hives.push(hive);
    }

    HttpResponse::Ok().json(doc!{"hives": hives})
}
