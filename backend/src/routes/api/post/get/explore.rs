use bson::{bson, doc, Document};
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
struct _Query {
    offset: i64,
}

#[get("/api/post/get/explore")]
pub async fn route(client: web::Data<mongodb::Client>, body: web::Query<_Query>) -> impl Responder {
    //TODO: do this

    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Posts");
    let collection_size = coll.count_documents(doc! {}, None).await.unwrap();

    let mut cursor = coll
        .aggregate(
            vec![
                doc! {
                    "$sample": {"size": collection_size as u32}
                },
                doc! { "$limit": 5 },
            ],
            None,
        )
        .await
        .unwrap();

    let vec: Vec<Document> = cursor.try_collect().await.unwrap();

    HttpResponse::Ok().json(doc! {
        "offset": body.offset + 5,
        "posts": vec
    })
}
