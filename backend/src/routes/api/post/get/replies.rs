use bson::{bson, doc, Document};
use futures::{StreamExt, TryStreamExt};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::{AggregateOptions, Collation};
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::verify_token},
    mongoose::{self, get_many::vec_to_str, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetRepliesQuery {
    post_id: String,
}

#[get("/api/post/get/replies")]
pub async fn route(
    body: web::Query<GetRepliesQuery>,
    client: web::Data<mongodb::Client>,
    req: HttpRequest,   
) -> impl Responder {
    //TODO: do this
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }


    let collation = Collation::builder().locale("en_US").numeric_ordering(true).build();
    let options = AggregateOptions::builder().collation(collation).build();

    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Posts");

    let cursor = coll.aggregate([
        doc! {
            "$match": {
                "replying_to": &body.post_id
            }
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
    ],options).await.unwrap();

    let mut many: Vec<Document> = cursor.try_collect().await.unwrap();
    let count = (&many).len() as i64;
    many.reverse();

    HttpResponse::Ok().json(doc! {
        "replies": many,
        "count": count
    })
}
