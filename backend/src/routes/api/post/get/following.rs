use bson::{bson, doc, Array, Document};
use futures::{StreamExt, TryStreamExt};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::{AggregateOptions, FindOptions};
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    mongoose::{self, get_many::vec_to_str, structures::user},
    poison::LockResultExt,
};

// #[get("/api/post/get/explore")]
// pub async fn route(client: web::Data<mongodb::Client>) -> impl Responder {
//     //TODO: do this

//     let many =
//         mongoose::get_many::get_many_random_document(&client, "beezle", "Posts", doc! {}).await;

//     HttpResponse::Ok().json(many)
// }

#[derive(Deserialize)]
struct _Post {
    offset: i64,
    filter_users: Array,
}

#[post("/api/post/get/following")]
pub async fn route(client: web::Data<mongodb::Client>, body: web::Json<_Post>) -> impl Responder {
    //TODO: do this

    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Posts");

    let options = FindOptions::builder()
        .skip(body.offset as u64)
        .limit(5)
        .sort(doc! {
            "$natural": -1
        })
        .build();

    let mut orFilter: Vec<bson::Document> = vec![];

    for bson_handle in &body.filter_users {
        let handle = bson_handle.as_str().unwrap();

        orFilter.push(doc! {
            "handle": handle
        });
    }

    let cursor = coll
        .find(
            doc! {
                "$or": orFilter
            },
            options,
        )
        .await
        .unwrap();
    let vec: Vec<Document> = cursor.try_collect().await.unwrap();

    HttpResponse::Ok().json(doc! {
        "offset": body.offset + 5,
        "posts": vec
    })
}
