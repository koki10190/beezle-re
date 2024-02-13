use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::{flate2::Status, hickory_resolver::proto::rr::rdata::name};
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
    profile_gradient1: String,
    profile_gradient2: String,
    name_color1: String,
    name_color2: String,
    square_avatar: bool,
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
            let unwrapped = _document.unwrap();
            // check unwrap
            let name_color_bought_bson = unwrapped
                .get("customization")
                .unwrap()
                .as_document()
                .unwrap()
                .get("name_color_bought");

            let mut name_color_bought = false;
            if name_color_bought_bson.is_some() {
                name_color_bought = name_color_bought_bson.unwrap().as_bool().unwrap();
            }

            let profile_gradient_bought_bson = unwrapped
                .get("customization")
                .unwrap()
                .as_document()
                .unwrap()
                .get("profile_gradient_bought");

            let mut profile_gradient_bought = false;
            if profile_gradient_bought_bson.is_some() {
                profile_gradient_bought = profile_gradient_bought_bson.unwrap().as_bool().unwrap();
            }

            let square_avatar_bought_bson = unwrapped
                .get("customization")
                .unwrap()
                .as_document()
                .unwrap()
                .get("square_avatar_bought");

            let mut square_avatar_bought = false;
            if square_avatar_bought_bson.is_some() {
                square_avatar_bought = square_avatar_bought_bson.unwrap().as_bool().unwrap();
            }

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

            if name_color_bought {
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
                                "color1": &body.name_color1,
                                "color2": &body.name_color2,
                            }
                        }
                    },
                )
                .await;
            }

            if profile_gradient_bought {
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {
                        "handle": &token_data.handle,
                    },
                    doc! {
                        "$set": {
                            "customization.profile_gradient": {
                                "color1": &body.profile_gradient1,
                                "color2": &body.profile_gradient2,
                            }
                        }
                    },
                )
                .await;
            }

            if square_avatar_bought {
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {
                        "handle": &token_data.handle,
                    },
                    doc! {
                        "$set": {
                            "customization.square_avatar": body.square_avatar
                        }
                    },
                )
                .await;
            }

            HttpResponse::Ok().json(doc! {"changed": true})
        }
    }
}
