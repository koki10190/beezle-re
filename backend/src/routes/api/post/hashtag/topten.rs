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

#[get("/api/post/hashtag/topten")]
pub async fn route(client: web::Data<mongodb::Client>, req: HttpRequest) -> impl Responder {
    //TODO: do this
    if !verify_token(&client, &req).await {
        return HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"});
    }

    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Hashtags");


    let collation = Collation::builder().locale("en_US").numeric_ordering(true).build();
    let options = AggregateOptions::builder().collation(collation).build();
    
    let cursor = coll.aggregate([
        doc! {
            "$group": doc! {
                "_id": "$hashtag",
                "count": doc! {
                    "$sum": 1
                }
            }
        },
        doc! {
            "$sort": doc! {
                "count": -1
            }
        },
        doc! {
            "$limit": 10
        }
    ], options).await.unwrap();

    let vec: Vec<Document> = cursor.try_collect().await.unwrap();

    HttpResponse::Ok().json(doc! {
        "hashtags": vec
    })
}
