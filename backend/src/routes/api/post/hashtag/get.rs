use bson::{bson, doc, Document, Regex};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::{AggregateOptions, Collation, FindOptions};
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::verify_token},
    mongoose::{self, get_many::vec_to_str, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct _Query {
    hashtag: String,
    offset: i64,
}

#[get("/api/post/hashtag/get")]
pub async fn route(client: web::Data<mongodb::Client>, req: HttpRequest, body: web::Query<_Query>) -> impl Responder {
    //TODO: do this
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Posts");


    let collation = Collation::builder().locale("en_US").numeric_ordering(true).build();
    let options = AggregateOptions::builder().collation(collation).build();
    
    let cursor = coll.aggregate([
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
                },
                "content": Regex { pattern: format!("#{}", body.hashtag), options: "".to_string() }
            }
        },
        doc! {
            "$sort": doc! {
                "creation_date": -1
            }
        },
        doc! {
            "$skip": &body.offset
        },
        doc! {
            "$limit": 5
        },
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
        }
    ], options).await.unwrap();

    let vec: Vec<Document> = cursor.try_collect().await.unwrap();

    HttpResponse::Ok().json(doc! {
        "offset": body.offset + 5,
        "posts": vec
    })
}
