use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use regex::Regex;
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, user_exists},
    mongoose::{self, add_coins, add_xp, structures::hashtag::Hashtag},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct TokenInfo {
    token: String,
    content: String,
    replying_to: String,
    is_reply: bool,
}

#[post("/api/post/create")]
pub async fn route(
    body: web::Json<TokenInfo>,
    client: web::Data<mongodb::Client>,
    fapp: web::Data<std::sync::Mutex<crate::data_struct::AppData>>,
) -> impl Responder {
    let token = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    );

    match token {
        Ok(_) => {
            let data = token.unwrap();
            let __post_id = uuid::Uuid::new().to_string();
            let struct_post_doc = mongoose::structures::post::Post {
                id: None,
                handle: data.claims.handle.to_string(),
                content: body.content.to_string(),
                creation_date: chrono::Utc::now(),
                repost: false,
                likes: vec![],
                reposts: vec![],
                post_id: __post_id.to_string(),
                edited: false,
                replying_to: body.replying_to.to_string(),
                is_reply: body.is_reply,
                reactions: doc! {}.into(),
            };

            // do notifications

            if body.is_reply {
                let replying_to_post = mongoose::get_document(
                    &client,
                    "beezle",
                    "Posts",
                    doc! {
                        "post_id": body.replying_to.to_string()
                    },
                )
                .await;

                if replying_to_post.is_none() {
                    return HttpResponse::Ok().json(doc! {"error": "Invalid reply!"});
                }

                let unwrapped = replying_to_post.unwrap();
                let handle = unwrapped.get("handle").unwrap().as_str().unwrap();

                if handle != data.claims.handle {
                    mongoose::update_document(
                        &client,
                        "beezle",
                        "Users",
                        doc! {
                            "handle": handle
                        },
                        doc! {
                            "$addToSet": {
                                "notifications": {
                                    "caller": &data.claims.handle,
                                    "post_id": &__post_id,
                                    "message": "replied to your post!"
                                }
                            }
                        },
                    )
                    .await;
                }
            }

            // /@([a-z\d_\.-]+)/gi

            let mention_regex = Regex::new(r"@([a-z\d_\.-]+)").unwrap();
            let hashtag_regex = Regex::new(r"#([A-Za-z0-9]+)").unwrap();
            for (_, [handle]) in mention_regex.captures_iter(body.content.clone().as_str()).map(|c| c.extract()) {
                beezle::print(format!("Found a mention: \"{}\"", handle).as_str());
                if !user_exists(&client, handle.to_string()).await {
                    continue;
                } 

                if handle != data.claims.handle {
                    mongoose::update_document(
                        &client,
                        "beezle",
                        "Users",
                        doc! {
                            "handle": handle
                        },
                        doc! {
                            "$addToSet": {
                                "notifications": {
                                    "caller": &data.claims.handle,
                                    "post_id": &__post_id,
                                    "message": "mentioned you!"
                                }
                            }
                        },
                    )
                    .await;
                }
            }

            for (_, [hashtag]) in hashtag_regex.captures_iter(body.content.clone().as_str()).map(|c| c.extract()) {
                beezle::print(format!("Found a hashtag: \"{}\"", hashtag).as_str());

                let hashtag_struct = Hashtag {
                    id: None,
                    hashtag: hashtag.to_string(),
                    from_user: data.claims.handle.clone(),
                    post_id: __post_id.clone()
                };

                let serialized_doc = mongodb::bson::to_bson(&hashtag_struct).unwrap();
                let document = serialized_doc.as_document().unwrap();
                mongoose::insert_document(&client, "beezle", "Hashtags", document.clone()).await;
            }

            let serialized_post_doc = mongodb::bson::to_bson(&struct_post_doc).unwrap();
            let document = serialized_post_doc.as_document().unwrap();

            mongoose::insert_document(&client, "beezle", "Posts", document.clone()).await;
            add_xp(&client, data.claims.handle.as_str(), 13).await;
            add_coins(&client, data.claims.handle.as_str(), 45).await;

            HttpResponse::Ok().json(document)
        }
        Err(_) => HttpResponse::Ok().json(doc! {"error": "Couldn't decode token"}),
    }
}
