use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::{flate2::Status, hickory_resolver::proto::rr::rdata::name};
use regex::Regex;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, patch, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, structures::user},
    poison::LockResultExt, routes::api::post::edit,
};

#[derive(Deserialize)]
struct ProfileImage {
    image: String,
    repeat: bool,
    enabled: bool,
    size: String,
}

#[derive(Deserialize)]
struct GetUserQuery {
    username: String,
    avatar: String,
    banner: String,
    about_me: String,
    activity: String,
    profile_gradient1: String,
    profile_gradient2: String,
    name_color1: String,
    name_color2: String,
    avatar_shape: i64,
    status: String,
    profile_image: Option<ProfileImage>,
}

#[patch("/api/profile/edit")]
pub async fn route(
    body: web::Json<GetUserQuery>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token = get_token(&req).unwrap();
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &token,
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

    let regex = Regex::new(r"\b^https?:\/\/i\.imgur\.com\S+").unwrap();
    if !regex.is_match(&s_Avatar) {
        return HttpResponse::Ok().json(doc! {"error": "Only Imgur links are allowed for safety reasons! You dirty ass fucking hacker, eat shit faggot"});
    }

    if !regex.is_match(&s_Banner) {
        return HttpResponse::Ok().json(doc! {"error": "Only Imgur links are allowed for safety reasons! You dirty ass fucking hacker, eat shit faggot"});
    }

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

            let profile_img_bought_bson = unwrapped
                .get("customization")
                .unwrap()
                .as_document()
                .unwrap()
                .get("profile_image");

            if let Some(profimg) = profile_img_bought_bson {
                let bought = profimg.as_document().unwrap().get("bought").unwrap().as_bool().unwrap();

                if let Some(edit_img) = &body.profile_image {
                    if !regex.is_match(&edit_img.image) {
                        return HttpResponse::Ok().json(doc! {"error": "Only Imgur links are allowed for safety reasons! You dirty ass fucking hacker, eat shit faggot"});
                    }

                    if bought {
                        mongoose::update_document(
                            &client,
                            "beezle",
                            "Users",
                            doc! {
                                "handle": &token_data.handle,
                            },
                            doc! {
                                "$set": {
                                    "customization.profile_image": {
                                        "bought": true,
                                        "repeat": &edit_img.repeat,
                                        "size": &edit_img.size,
                                        "enabled": &edit_img.enabled,
                                        "image": &edit_img.image,
                                    }
                                }
                            },
                        )
                        .await;
                    }
                }
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
                        "activity": &body.activity,
                        "status": &body.status
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

            println!("{}", body.avatar_shape);
            mongoose::update_document(
                &client,
                "beezle",
                "Users",
                doc! {
                    "handle": &token_data.handle,
                    "customization.owned_shapes": body.avatar_shape
                },
                doc! {
                    "$set": {
                        "customization.square_avatar": body.avatar_shape
                    }
                },
            )
            .await;

            if body.avatar_shape == 0 {
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {
                        "handle": &token_data.handle,
                    },
                    doc! {
                        "$set": {
                            "customization.square_avatar": body.avatar_shape
                        }
                    },
                )
                .await;
            }

            HttpResponse::Ok().json(doc! {"changed": true})
        }
    }
}
