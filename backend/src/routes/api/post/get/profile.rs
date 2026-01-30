use bson::{bson, doc, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::{AggregateOptions, Collation, FindOptions};
use serde::{Deserialize, Serialize};
use serde_repr::*;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::{check_if_blocked, get_token_data, verify_token}},
    mongoose::{self, get_many::vec_to_str, structures::{post::{Post, POST_OFFSET}, user}},
    poison::LockResultExt,
};

#[derive(Deserialize_repr, Serialize_repr)]
#[repr(u8)]
enum ProfileFetchMode {
    NEWEST = 0,
    OLDEST = 1,
    MEDIA = 2
}

#[derive(Deserialize)]
struct ProfileQuery {
    handle: String,
    offset: i64,
    mode: ProfileFetchMode
}

#[get("/api/post/get/profile")]
pub async fn route(
    body: web::Query<ProfileQuery>,
    client: web::Data<mongodb::Client>,
    req: HttpRequest
) -> impl Responder {
    //TODO: do this
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    let token_user = get_token_data(&client, &req).unwrap().claims;

    // User is blocked!
    if check_if_blocked(&client, &token_user.handle, &body.handle).await {
        println!("you're blocked buddy");
        return HttpResponse::Ok().json(doc! {
            "posts": vec![] as Vec<Document>,
            "offset": &body.offset,
            "blocked": true
        });
    }


    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Posts");

    // [1,2,3,4,5,6,7,8,9,10]
    // skip 0 so 1
    // limit 5 so 1, 2, 3, 4, 5 is fetched
    // next skip 5, so its 6 since 5 elements got skipped
    // limit five meaning we fetch 6,7,8,9,10

    let collation = Collation::builder().locale("en_US").numeric_ordering(true).build();
    let options = AggregateOptions::builder().collation(collation).build();

    let mut aggregation: Vec<Document> = vec![
        doc! {
            "$match": {
                "handle": &body.handle
            }
        },
        
    ];

    // /\bhttps?:\/\/i\.imgur\.com\S+/gi
    match body.mode {
        ProfileFetchMode::MEDIA=> {
            aggregation.push(doc!{
                "$match": {
                    "content": mongodb::bson::Regex {
                        pattern: r"\bhttps?:\/\/i\.imgur\.com\S+".to_string(),
                        options: "i".to_string()
                    }
                }
            });
            aggregation.push(doc!{
                "$match": {
                    "repost": false
                }
            });
            aggregation.push(doc!{"$sort":doc!{"creation_date": -1}});
        }
        ProfileFetchMode::NEWEST => {
            aggregation.push(doc!{"$sort":doc!{"creation_date": -1}});
        },
        ProfileFetchMode::OLDEST => {
            aggregation.push(doc!{"$sort":doc!{"creation_date": 1}});
        },
    }

    let mut extra_aggr = vec![doc! {
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
        }];

        aggregation.append(&mut extra_aggr);


    let cursor = coll
        .aggregate(
            aggregation.into_iter(),
            options
        )
        .await
        .unwrap();

    let vec: Vec<Document> = cursor.try_collect().await.unwrap();

    HttpResponse::Ok().json(doc! {
        "posts": vec,
        "offset": body.offset + POST_OFFSET
    })
}
