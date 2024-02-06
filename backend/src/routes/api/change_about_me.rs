use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::{env, ops::Deref};

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    data_struct::AppData,
    mongoose::{self, structures::user},
};

#[derive(Deserialize)]
struct GetUserQuery {
    token: String,
    about_me: String,
}

#[post("/api/change_about_me")]
pub async fn route(
    body: web::Json<GetUserQuery>,
    app: web::Data<std::sync::Mutex<AppData>>,
) -> impl Responder {
    let mut app_data = app.lock().unwrap();

    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    let auth_doc = mongoose::get_document(
        &app_data.client,
        "beezle",
        "Users",
        doc! { "handle": &token_data.handle, "hash_password": &token_data.hash_password },
    )
    .await;

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"changed": false, "error": "User not found!"}),
        _document => {
            mongoose::update_document(
                &app_data.client,
                "beezle",
                "Users",
                doc! {

                    "handle": &token_data.handle,
                },
                doc! {
                    "$set": {
                        "about_me": &body.about_me
                    }
                },
            )
            .await;

            HttpResponse::Ok().json(doc! {"changed": true})
        }
    }
}
