use anyhow::Ok;
use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use regex::Regex;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::{Arc, Mutex}};

use actix_web::{get, patch, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

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
    handle: String,
    hive_id: String
}

#[patch("/api/hives/edit")]
pub async fn route(
    body: web::Json<HiveData>,
    client: web::Data<mongodb::Client>,
    req: HttpRequest,
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }
    
    let token_data = get_token_data(&client, &req).unwrap();

    let regex = Regex::new(r"\b^https?:\/\/i\.imgur\.com\S+").unwrap();

    if !regex.is_match(&body.icon) || !regex.is_match(&body.banner) {
        return HttpResponse::Ok().json(doc! {"error": "Only Imgur links are allowed for safety reasons! You dirty ass fucking hacker, eat shit faggot"});
    }

    let mongo_hive = mongoose::get_document(&client, "beezle", "Hives", doc! {
        "owner": &token_data.claims.handle,
        "hive_id": &body.hive_id
    }).await;

    if mongo_hive.is_none() {
        return HttpResponse::Ok().json(doc! {"error": "You're not the queen of this hive!"});
    }

    mongoose::update_document(&client, "beezle", "Hives", doc!{
        "owner": &token_data.claims.handle,
        "hive_id": &body.hive_id
    }, doc! {
        "$set": {
            "icon": &body.icon,
            "banner": &body.banner,
            "name": &body.name,
            "description": &body.description,
            "handle": &body.handle,
        }
    }).await;

    HttpResponse::Ok().json(doc!{"message": "Hive has been edited successfully!"})
}
