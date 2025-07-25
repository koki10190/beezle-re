use bson::{bson, doc, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::FindOptions;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::verify_token},
    mongoose::{self, get_many::vec_to_str, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct ProfileQuery {
    handle: String,
    offset: i64,
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

    let db = client.database("beezle");
    let coll: mongodb::Collection<Document> = db.collection("Posts");

    // [1,2,3,4,5,6,7,8,9,10]
    // skip 0 so 1
    // limit 5 so 1, 2, 3, 4, 5 is fetched
    // next skip 5, so its 6 since 5 elements got skipped
    // limit five meaning we fetch 6,7,8,9,10

    let options = FindOptions::builder()
        .skip(body.offset as u64)
        .limit(5)
        .sort(doc! {
            "$natural": -1
        })
        .build();

    let cursor = coll
        .find(
            doc! {
                "handle": &body.handle
            },
            options,
        )
        .await
        .unwrap();

    let vec: Vec<Document> = cursor.try_collect().await.unwrap();

    HttpResponse::Ok().json(doc! {
        "posts": vec,
        "offset": body.offset + 5
    })
}
