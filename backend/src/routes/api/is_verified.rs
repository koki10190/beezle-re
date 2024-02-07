use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{beezle, mongoose, poison::LockResultExt};

#[derive(Deserialize)]
struct TokenInfo {
    token: String,
}

#[post("/api/is_verified")]
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
            let data = token.unwrap();
            let user = mongoose::get_document(
                &client,
                "beezle",
                "Users",
                doc! {
                    "handle": data.claims.handle,
                    "email": data.claims.email,
                },
            )
            .await
            .unwrap();

            let is_verified = user.clone().get("verified").unwrap().as_bool();

            HttpResponse::Ok().json(doc! {"verified": is_verified})
        }
        Err(_) => HttpResponse::Ok().json(doc! {"error": "Couldn't decode token"}),
    }
}
