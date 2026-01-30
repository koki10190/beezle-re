use anyhow::Ok;
use bson::{doc, uuid, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mongodb::options::FindOptions;
use regex::Regex;
use serde::Deserialize;
use std::{collections::HashMap, env, sync::{Arc, Mutex}};

use actix_web::{delete, get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::{get_token, get_token_data, verify_token}, mongo, user_exists, ws_send_notification},
    mongoose::{self, add_coins, add_xp, structures::{hashtag::Hashtag, Hive}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct _Query {
    hive_id: String,
    post_id: String
}

#[delete("/api/hives/dashboard/delete_post")]
pub async fn route(
    body: web::Query<_Query>,
    client: web::Data<mongodb::Client>,
    req: HttpRequest,
) -> impl Responder {
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }
    
    let token_data = get_token_data(&client, &req).unwrap();

    let mongo_hive = mongoose::get_document(&client, "beezle", "Hives", doc! {
        "$or": [
            {
                "moderators": {
                    "$in": [&token_data.claims.handle]
                },
            },
            {
                "owner": &token_data.claims.handle
            }
        ],
        "hive_id": &body.hive_id
    }).await;

    if mongo_hive.is_none() {
        return HttpResponse::Ok().json(doc! {"error": "You're not authorized!"});
    }

    mongoose::delete_document(&client, "beezle", "Posts", doc!{
        "hive_post": &body.hive_id,
        "post_id": &body.post_id
    }).await;

    HttpResponse::Ok().json(doc!{"message": "Post has been deleted successfully."})
}
