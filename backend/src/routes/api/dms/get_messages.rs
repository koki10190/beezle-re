use bson::{doc, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::AggregateOptions;
use regex::Regex;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, patch, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, structures::{dm_msg::MESSAGE_FETCH_OFFSET, user}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    offset: i64,
    handle: String
}

#[post("/api/dms/get_messages")]
pub async fn route(
    body: web::Json<GetUserQuery>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token = get_token(&req).unwrap();
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;


    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("dmmessages");   

    println!("^({};{}|{};{})$", token_data.handle, body.handle, body.handle, token_data.handle);

    let options = AggregateOptions::builder().allow_disk_use(true).build();
    let mut cursor = coll
        .aggregate(
            vec![
                doc! {
                    "$match": doc! {
                        "channel": mongodb::bson::Regex {
                            pattern: format!("^({};{}|{};{})$", token_data.handle, body.handle, body.handle, token_data.handle),
                            options: "i".to_string()
                        }
                    }
                },
                doc! { "$limit": MESSAGE_FETCH_OFFSET },
                doc! {
                    "$sort": {
                        "timestamp": 1
                    }
                },
            ],
            options,
        )
        .await
        .unwrap();

    let mut vec: Vec<Document> = cursor.try_collect().await.unwrap();
    
    HttpResponse::Ok().json(doc! {
        "offset": body.offset + MESSAGE_FETCH_OFFSET,
        "messages": vec
    })
}
