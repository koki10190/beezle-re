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
                    "$lookup": doc! {
                        "from": "Users",
                        "localField": "handle",
                        "foreignField": "handle",
                        "as": "user_info"
                    }
                },
                doc! {
                    "$match": doc! {
                        "user_info.reputation": doc! {
                            "$gte": 25
                        }
                    }
                },
                doc! {
                    "$sort": doc! {
                        "creation_date": -1
                    }
                },
                doc! {
                    "$sample": {"size": collection_size as u32}
                },
                doc! { "$limit": 5 },
                doc! {
                    "$project": doc! {
                        "edited": 1,
                        "handle": 1,
                        "creation_date": 1,
                        "content": 1,
                        "post_op_handle": 1,
                        "post_op_id": 1,
                        "is_reply": 1,
                        "post_id": 1,
                        "reactions": 1,
                        "reposts": 1,
                        "repost": 1,
                        "likes": 1,
                        "replying_to": 1
                    }
                },
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
