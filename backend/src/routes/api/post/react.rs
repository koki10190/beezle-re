use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{beezle, mongoose, poison::LockResultExt};

#[derive(Deserialize)]
struct TokenInfo {
    token: String,
    post_id: String,
    emoji: String,
}

#[post("/api/post/react")]
pub async fn route(
    body: web::Json<TokenInfo>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    );

    match token {
        Ok(_) => {
            let data = token.unwrap().claims;

            let auth_doc = mongoose::get_document(
                &client,
                "beezle",
                "Users",
                doc! { "handle": data.handle, "hash_password": data.hash_password },
            )
            .await;

            match auth_doc {
                None => HttpResponse::Ok().json(doc! {"changed": false, "error": "User not found!"}),
                _document => {
                    let doc_data = _document.unwrap();
                    let struct_reaction_doc = mongoose::structures::reactions::React {
                        id: None,
                        post_id: body.post_id.clone(),
                        handle: doc_data.get("handle").unwrap().to_string(),
                        emoji: body.emoji.clone()
                    };
                    
                    let react_doc = mongoose::get_document(&client, "beezle", "Reactions", doc! {
                        "post_id": body.post_id.clone(),
                        "handle": doc_data.get("handle").unwrap().to_string(),
                        "emoji": body.emoji.clone()
                    }).await;

                    if react_doc.is_none() {
                        let serialized_reaction_doc = mongodb::bson::to_bson(&struct_reaction_doc).unwrap();
                        let document = serialized_reaction_doc.as_document().unwrap();

                        mongoose::insert_document(&client, "beezle", "Reactions", document.clone()).await;
                    } else {
                        mongoose::delete_document(&client, "beezle", "Reactions", doc! {
                            "post_id": body.post_id.clone(),
                            "handle": doc_data.get("handle").unwrap().to_string(),
                            "emoji": body.emoji.clone()
                        }).await;
                    }

                    let post_doc = mongoose::get_document(
                        &client,
                        "beezle",
                        "Posts",
                        doc! {
                            "post_id": body.post_id.clone()
                        },
                    )
                    .await;

                    HttpResponse::Ok().json(post_doc)
                }
            }


            // mongoose::update_document(
            //     &client,
            //     "beezle",
            //     "Posts",
            //     doc! {"post_id": &body.post_id},
            //     doc! {
            //         "$inc": {
            //             format!("reactions.{}", &body.emoji): 1
            //         }
            //     },
            // )
            // .await;

            // return HttpResponse::Ok().json(post_doc);
        }
        Err(_) => HttpResponse::Ok().json(doc! {"error": "Couldn't decode token"}),
    }
}
