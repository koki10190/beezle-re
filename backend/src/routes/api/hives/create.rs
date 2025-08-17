use anyhow::Ok;
use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
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
struct HiveData {
    icon: String,
    banner: String,
    name: String,
    description: String,
    handle: String
}

#[post("/api/hives/create")]
pub async fn route(
    body: web::Json<HiveData>,
    client: web::Data<mongodb::Client>,
    req: HttpRequest,
    ws_sessions: web::Data<Arc<Mutex<HashMap<String, actix_ws::Session>>>>
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }
    
    let token_data = get_token_data(&client, &req).unwrap();
    
    let doc = mongoose::get_document(&client, "beezle", "Hives", doc!{
        "handle": mongodb::bson::Regex {
            pattern: body.handle.replace("@", "").to_string(),
            options: "i".to_string()
        }
    }).await;

    if doc.is_some() {
        return HttpResponse::Ok().json(doc!{"error": format!("A Hive with the handle \"{}\" already exists!", &body.handle)});
    }

    let regex = Regex::new(r"\b^https?:\/\/i\.imgur\.com\S+").unwrap();

    if !regex.is_match(&body.icon) || !regex.is_match(&body.banner) {
        return HttpResponse::Ok().json(doc! {"error": "Only Imgur links are allowed for safety reasons! You dirty ass fucking hacker, eat shit faggot"});
    }

    let hive_id = uuid::Uuid::new().to_string();
    let hive = Hive {
        id: None,
        hive_id: hive_id.clone(),
        handle: body.handle.clone(),
        name: body.name.clone(),
        description: body.description.clone(),
        icon: body.icon.clone(),
        banner: body.banner.clone(),
        owner: token_data.claims.handle.clone(),
        creation_date: chrono::Utc::now(),
        moderators: vec![].into(),
        levels: mongoose::structures::hive::HiveLevels { level: 0, xp: 0 },
        coins: 0
    };

    let serialized = mongodb::bson::to_bson(&hive).unwrap();
    mongoose::insert_document(&client, "beezle", "Hives", serialized.as_document().unwrap().clone()).await;


    let hive_member = HiveMember {
        id: None,
        part_of: hive_id.clone(),
        handle: token_data.claims.handle.clone(),
        join_date: chrono::Utc::now(),
    };

    let bson = bson::to_bson(&hive_member).unwrap();
    let hivememdoc = bson.as_document().unwrap();

    mongoose::insert_document(&client, "beezle", "HiveMembers", hivememdoc.clone()).await;

    HttpResponse::Ok().json(doc!{"message": "Hive has been created successfully!", "hive": serialized.as_document().unwrap()})
}
