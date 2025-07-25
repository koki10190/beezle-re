use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::Client;
use serde::Deserialize;
use std::{env, ops::Deref};

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token},
    data_struct::AppData,
    mongoose::{self, coins::get_level, get_coins, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
}

#[post("/api/user/buy/name_color")]
pub async fn route(req: HttpRequest, client: web::Data<Client>) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &get_token(&req).unwrap(),
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    let auth_doc = mongoose::get_document(
        &client,
        "beezle",
        "Users",
        doc! { "handle": &token_data.handle, "hash_password": &token_data.hash_password },
    )
    .await;

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"changed": false, "error": "User not found!"}),
        _document => {
            let unwrapped = _document.unwrap();
            let coins = get_coins(&client, &token_data.handle).await;
            let level = get_level(&client, &token_data.handle).await;

            if level < 10 {
                return HttpResponse::Ok().json(
                    doc! {"bought": false, "error": "You need to be level 10 to buy this item!"},
                );
            }
            if coins < 7500 {
                return HttpResponse::Ok()
                    .json(doc! {"bought": false, "error": "Cannot afford this item!"});
            }

            mongoose::add_coins(&client, &token_data.handle, -7500).await;

            mongoose::update_document(
                &client,
                "beezle",
                "Users",
                doc! {

                    "handle": &token_data.handle,
                },
                doc! {
                    "$set": {
                        "customization.name_color": {
                            "color1": "#ffffff",
                            "color2": "#000000"
                        },
                        "customization.name_color_bought": true
                    }
                },
            )
            .await;

            HttpResponse::Ok().json(doc! {"bought": true})
        }
    }
}
