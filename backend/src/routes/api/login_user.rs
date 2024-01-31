use bson::{doc, uuid, Document};
use chrono::Utc;
use jsonwebtoken::{EncodingKey, Header};
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{beezle, mongoose};

#[derive(Deserialize)]
struct LoginInfo {
    email: String,
    password: String,
}

#[post("/api/login_user")]
pub async fn route(
    client: web::Data<mongodb::Client>,
    req: HttpRequest,
    body: web::Json<LoginInfo>,
) -> impl Responder {
    let mut doc = mongoose::get_document(
        &client,
        "beezle",
        "Users",
        doc! {"$or": [
            {
                "email": body.email.clone()
            },
            {
                "handle": body.email.clone()
            }
        ]},
    )
    .await;

    match doc {
        None => HttpResponse::Ok().json(doc! {"error": "Invalid Email or Handle!"}),
        _document => {
            let mut email = _document.clone().unwrap().get("email").unwrap().to_string();

            let mut username = _document
                .clone()
                .unwrap()
                .get("username")
                .unwrap()
                .to_string();

            let mut handle = _document
                .clone()
                .unwrap()
                .get("handle")
                .unwrap()
                .to_string();

            let mut password = _document
                .clone()
                .unwrap()
                .get("hash_password")
                .unwrap()
                .to_string();

            email = beezle::rem_first_and_last(&email).to_string();
            username = beezle::rem_first_and_last(&username).to_string();
            handle = beezle::rem_first_and_last(&handle).to_string();
            password = beezle::rem_first_and_last(&password).to_string();

            let matched_passwords =
                beezle::crypt::verify_password_hash(body.password.as_str(), password.as_str());

            match matched_passwords {
                true => {
                    let jwt_user = mongoose::structures::user::JwtUser {
                        handle: handle.to_string(),
                        username: username.to_string(),
                        email: email.to_string(),
                        exp: chrono::TimeZone::with_ymd_and_hms(&Utc, 2050, 1, 1, 0, 0, 0)
                            .unwrap()
                            .timestamp() as usize,
                    };

                    let token = jsonwebtoken::encode(
                        &Header::default(),
                        &jwt_user,
                        &EncodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
                    )
                    .unwrap();

                    HttpResponse::Ok().json(doc! {"token": token})
                }
                false => HttpResponse::Ok().json(doc! {"error": "Invalid Password!"}),
            }
        }
    }
}
