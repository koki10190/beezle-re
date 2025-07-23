use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::Predicate;
use serde::Deserialize;
use std::env;

use actix_web::{
    delete, get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder,
};

use crate::{
    beezle,
    mongoose::{self, add_coins, get_coins, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct ChangePassQuery {
    token: String,
    emoji_url: String,
    emoji_id: String,
}

#[post("/api/user/upload_emoji")]
pub async fn route(
    req: HttpRequest,
    body: web::Json<ChangePassQuery>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    let user_doc = mongoose::get_document(
        &client,
        "beezle",
        "Users",
        doc! { "handle": &token_data.handle, "hash_password": &token_data.hash_password },
    )
    .await;

    match user_doc {
        None => HttpResponse::Ok().json(doc! {"error": "Not Found!"}),
        _document => {
            if get_coins(&client, &token_data.handle).await < 500 {
                return HttpResponse::Ok()
                    .json(doc! {"error": "You cannot afford to upload an emoji!"});
            }

            let unwrapped = _document.unwrap();

            let customization = unwrapped.get("customization");

            if customization.is_none() {
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! { "handle": &token_data.handle, "hash_password": &token_data.hash_password },
                    doc! {
                        "$set": {
                            "customization": { "emojis": [] }
                        }
                    },
                ).await;
            }

            mongoose::update_document(
                &client,
                "beezle",
                "Users",
                doc! { "handle": &token_data.handle, "hash_password": &token_data.hash_password },
                doc! {
                    "$addToSet": {
                        "customization.emojis": {
                            "imgUrl": &body.emoji_url,
                            "id": &body.emoji_id.to_lowercase(),
                            "names": [&body.emoji_id.to_lowercase()]
                        }
                    }
                },
            )
            .await;

            add_coins(&client, &token_data.handle, -500).await;

            HttpResponse::Ok().json(doc! {"message": "Emoji uploaded."})
        }
    }
}
