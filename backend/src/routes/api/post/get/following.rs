use bson::{bson, doc, Array, Document};
use futures::{StreamExt, TryStreamExt};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::{AggregateOptions, Collation, FindOptions};
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::verify_token},
    mongoose::{self, get_many::vec_to_str, structures::{post::POST_OFFSET, user}},
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
pub async fn route(client: web::Data<mongodb::Client>, body: web::Json<_Post>, req: HttpRequest) -> impl Responder {
    //TODO: do this
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Posts");

    let options = FindOptions::builder()
        .skip(body.offset as u64)
        .limit(POST_OFFSET)
        .sort(doc! {
            "$natural": -1
        })
        .build();

    let collation = Collation::builder().locale("en_US").numeric_ordering(true).build();
    let options = AggregateOptions::builder().collation(collation).build();

    let mut orFilter: Vec<bson::Document> = vec![doc!{"handle": "beezle"}];

    for bson_handle in &body.filter_users {
        let handle = bson_handle.as_str().unwrap();

        orFilter.push(doc! {
            "handle": handle
        });
    }

    let cursor = coll
        .aggregate(
            [
                doc! {
                    "$match": {
                        "$or": orFilter
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
                    "$limit": POST_OFFSET
                },
                doc! {
                    "$lookup": doc! {
                        "from": "Reactions",
                        "localField": "post_id",
                        "foreignField": "post_id",
                        "as": "post_reactions"
                    }
                },
                doc! {
                    "$lookup": doc! {
                        "from": "Posts",
                        "localField": "post_id",
                        "foreignField": "replying_to",
                        "as": "reply_posts"
                    }
                },
                doc! {
                    "$addFields": doc! {
                        "reply_count": doc! {
                            "$size": "$reply_posts"
                        }
                    }
                },
            ],
            options
        )
        .await
        .unwrap();
    let vec: Vec<Document> = cursor.try_collect().await.unwrap();

    HttpResponse::Ok().json(doc! {
        "offset": body.offset + POST_OFFSET,
        "posts": vec
    })
}
