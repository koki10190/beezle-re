use bson::{bson, doc, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::FindOptions;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    mongoose::{self, get_many::vec_to_str, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct _Query {
    search: String,
}

#[get("/api/post/search")]
pub async fn route(client: web::Data<mongodb::Client>, body: web::Query<_Query>) -> impl Responder {
    //TODO: do this

    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Posts");

    // [1,2,3,4,5,6,7,8,9,10]
    // skip 0 so 1
    // limit 5 so 1, 2, 3, 4, 5 is fetched
    // next skip 5, so its 6 since 5 elements got skipped
    // limit five meaning we fetch 6,7,8,9,10

    let options = FindOptions::builder().limit(25).build();

    let cursor = coll
        .find(
            doc! {
            "$or": [
                {
                    "handle": mongodb::bson::Regex {
                        pattern: body.search.to_string(),
                        options: "i".to_string()
                    }
                },
                {
                    "content":  mongodb::bson::Regex {
                        pattern: body.search.to_string(),
                        options: "i".to_string()
                    }
                },
                {
                    "post_id":  mongodb::bson::Regex {
                        pattern: body.search.to_string(),
                        options: "i".to_string()
                    }
                }
            ],

            "repost": false
            },
            options,
        )
        .await
        .unwrap();

    let vec: Vec<Document> = cursor.try_collect().await.unwrap();

    HttpResponse::Ok().json(doc! {
        "posts": vec
    })
}
