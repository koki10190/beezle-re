use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::Client;
use serde::Deserialize;
use std::{env, ops::Deref};

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    data_struct::AppData,
    mongoose::{self, get_coins, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    token: String,
}

#[post("/api/user/buy/name_color")]
pub async fn route(body: web::Json<GetUserQuery>, client: web::Data<Client>) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
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

            if coins < 15000 {
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
