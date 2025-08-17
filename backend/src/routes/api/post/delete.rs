use bson::{doc, Bson, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{delete, get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, hives::{self, get_hive}, structures::{post::Post, user}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct PostEditData {
    post_id: String,
}

#[delete("/api/post/delete")]
pub async fn route(
    body: web::Query<PostEditData>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token = decode::<mongoose::structures::user::JwtUser>(
        &get_token(&req).unwrap(),
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    );

    match token {
        Ok(_) => {
            let data = token.unwrap();

            let post = mongoose::get_document(&client, "beezle", "Posts", doc!{
                "post_id": &body.post_id
            }).await;

            if let Some(post_doc) = post {
                let post: Post = bson::from_bson(Bson::Document(post_doc)).unwrap();
                
                if post.hive_post.is_some() {
                    let hive_id = post.hive_post.unwrap();
                    let hive = get_hive(&client, &hive_id).await;

                    if let Some(hive) = hive {
                        hives::add_coins(&client, &hive_id, -5).await;
                        hives::add_xp(&client, &hive_id, -1).await;
                    }
                }
            }

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
