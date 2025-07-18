use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct PostEditData {
    post_id: String,
    token: String,
}

#[post("/api/post/delete")]
pub async fn route(
    body: web::Json<PostEditData>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    );

    match token {
        Ok(_) => {
            let data = token.unwrap();

            mongoose::delete_document(
                &client,
                "beezle",
                "Posts",
                doc! {
                    "handle": &data.claims.handle,
                    "post_id": &body.post_id
                },
            )
            .await;

            mongoose::delete_document(
                &client,
                "beezle",
                "Posts",
                doc! {
                    "post_op_handle": &data.claims.handle,
                    "post_op_id": &body.post_id
                },
            )
            .await;

            mongoose::delete_many_document(
                &client,
                "beezle",
                "Hashtags",
                doc! {
                    "post_id": &body.post_id
                },
            )
            .await;            

            mongoose::add_coins(&client, &data.claims.handle, -40).await;

            return HttpResponse::Ok().json(doc! {"message": "Deleted post successfully."});
        }
        Err(_) => HttpResponse::Ok().json(doc! {"error": "Couldn't decode token"}),
    }
}
