use bson::{bson, doc, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::{AggregateOptions, Collation, FindOptions};
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::{get_blocked_users_as_vec, get_token_data, get_users_that_blocked_as_vec, verify_token}},
    mongoose::{self, get_many::vec_to_str, structures::{post::POST_OFFSET, user}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct _Query {
    offset: i64,
}

#[get("/api/post/get/now")]
pub async fn route(client: web::Data<mongodb::Client>, req: HttpRequest, body: web::Query<_Query>) -> impl Responder {
    //TODO: do this

    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Posts");

    // [1,2,3,4,5,6,7,8,9,10]
    // skip 0 so 1
    // limit 5 so 1, 2, 3, 4, 5 is fetched
    // next skip 5, so its 6 since 5 elements got skipped
    // limit five meaning we fetch 6,7,8,9,10

    // let options = AggregateOptions::builder()
    //     .skip(body.offset as u64)
    //     .limit(5)
    //     .sort(doc! {
    //         "$natural": -1
    //     })
    //     .build();

    let token_user = get_token_data(&client, &req).unwrap().claims;

    let collation = Collation::builder().locale("en_US").numeric_ordering(true).build();
    let options = AggregateOptions::builder().collation(collation).build();
    
    let mut blocked_users = get_blocked_users_as_vec(&client, &token_user.handle).await;
    let mut blocked_by_users = get_users_that_blocked_as_vec(&client, &token_user.handle).await;
    blocked_users.append(&mut blocked_by_users);

    // coll.aggregate(, options)
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
                }
            }
        },
        // Blocked Users are excluded
        doc! {
            "$match": { 
                "handle": {
                    "$nin": blocked_users
                }
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
                "post_reactions": 1,
                "reposts": 1,
                "repost": 1,
                "likes": 1,
                "reply_count": 1,
                "replying_to": 1
            }
        }
    ], options).await.unwrap();

    let vec: Vec<Document> = cursor.try_collect().await.unwrap();

    HttpResponse::Ok().json(doc! {
        "offset": body.offset + POST_OFFSET,
        "posts": vec
    })
}
