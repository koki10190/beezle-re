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
struct GetUserQuery {
    token: String,
    username: String,
    avatar: String,
    banner: String,
    about_me: String,
    activity: String,
}

#[post("/api/profile/edit")]
pub async fn route(
    body: web::Json<GetUserQuery>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
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
    beezle::print(&body.avatar);
    let mut s_Avatar = body.avatar.clone();
    let mut s_Banner = body.banner.clone();

    if body.username == "" {
        return HttpResponse::Ok()
            .json(doc! {"changed": false, "error": "Username cannot be null!"});
    }

    if body.username.len() > 12 {
        return HttpResponse::Ok().json(
            doc! { "changed": false, "error": "Username must be shorter than 12 characters!" },
        );
    }

    // if body.avatar == "" {
    //     s_Avatar = "https://i.imgur.com/yiuTHhc.png".to_string();
    // }

    // if body.banner == "" {
    //     s_Banner = "https://i.imgur.com/yiuTHhc.png".to_string();
    // }

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"changed": false, "error": "User not found!"}),
        _document => {
            mongoose::update_document(
                &client,
                "beezle",
                "Users",
                doc! {
                    "handle": &token_data.handle,
                },
                doc! {
                    "$set": {
                        "username": &body.username,
                        "about_me": &body.about_me,
                        "avatar": &s_Avatar,
                        "banner": &s_Banner,
                        "activity": &body.activity
                    }
                },
            )
            .await;

            HttpResponse::Ok().json(doc! {"changed": true})
        }
    }
}
