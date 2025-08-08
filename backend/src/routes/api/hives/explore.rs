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
    offset: i64,
}

#[get("/api/hives/explore")]
pub async fn route(
    body: web::Query<_Query>,
    client: web::Data<mongodb::Client>,
    req: HttpRequest,
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }
    
    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Hives");
    let options = FindOptions::builder().skip(body.offset as u64).limit(10).sort(doc! {
        "$natural": -1
    }).build();
    
    let cursor = coll.find(doc!{}, options).await.unwrap();

    let vec: Vec<Document> = cursor.try_collect().await.unwrap();

    HttpResponse::Ok().json(doc!{"hives": vec, "offset": &body.offset + 10})
}
