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
    mongoose::{self, coins::get_level, get_coins, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    token: String,
    shape: u64
}

struct AvatarShape { 
    name: &'static str,
    price: i64, 
    style: &'static str,
    level_required: i64,
}

const AVATAR_SHAPES: [AvatarShape; 14] = [
    AvatarShape {
        name: "Circle Avatar Shape",
        price: 0,
        level_required: 0,
        style: "",
    },
    AvatarShape {
        name: "Hexagon Avatar Shape",
        price: 5000,
        level_required: 7,
        style: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)",
    },
    AvatarShape {
        name: "Square Avatar Shape",
        price: 1000,
        level_required: 5,
        style: "polygon(0 0, 100% 0%, 100% 100%, 0% 100%)",
    },
    AvatarShape {
        name: "Parallelogram Right Avatar Shape",
        price: 4500,
        level_required: 10,
        style: "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
    },
    AvatarShape {
        name: "Parallelogram Left Avatar Shape",
        price: 4500,
        level_required: 10,
        style: "polygon(0 1%, 75% 0, 100% 100%, 25% 100%)",
    },
    AvatarShape {
        name: "Triangle Avatar Shape",
        price: 1500,
        level_required: 5,
        style: "polygon(50% 0%, 0% 100%, 100% 100%)",
    },
    AvatarShape {
        name: "Rhombus Avatar Shape",
        price: 2000,
        level_required: 10,
        style: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    },
    AvatarShape {
        name: "Pentagon Avatar Shape",
        price: 5000,
        level_required: 15,
        style: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
    },
    AvatarShape {
        name: "Rabbet Avatar Shape",
        price: 5000,
        level_required: 20,
        style: "polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)",
    },
    AvatarShape {
        name: "Octagon Avatar Shape",
        price: 5000,
        level_required: 20,
        style: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
    },
    AvatarShape {
        name: "X Avatar Shape",
        price: 15000,
        level_required: 20,
        style: "polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%)",
    },
    AvatarShape {
        name: "Right Chevron Avatar Shape",
        price: 10000,
        level_required: 15,
        style: "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)",
    },
    AvatarShape {
        name: "Left Chevron Avatar Shape",
        price: 10000,
        level_required: 15,
        style: "polygon(100% 0%, 75% 50%, 100% 100%, 25% 100%, 0% 50%, 25% 0%)",
    },
    AvatarShape {
        name: "Star Avatar Shape",
        price: 15000,
        level_required: 30,
        style: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    },
];

#[post("/api/user/buy/avatar")]
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
            let level = get_level(&client, &token_data.handle).await;
            if level < AVATAR_SHAPES[body.shape as usize].level_required {
                return HttpResponse::Ok().json(
                    doc! {"bought": false, "error": format!("You need to be level {} to buy this item!", AVATAR_SHAPES[body.shape as usize].level_required)},
                );
            }

            if coins < AVATAR_SHAPES[body.shape as usize].price {
                return HttpResponse::Ok()
                    .json(doc! {"bought": false, "error": "Cannot afford this item!"});
            }

            mongoose::add_coins(&client, &token_data.handle, -AVATAR_SHAPES[body.shape as usize].price).await;

            mongoose::update_document(
                &client,
                "beezle",
                "Users",
                doc! {

                    "handle": &token_data.handle,
                },
                doc! {
                    "$push": {
                        "customization.owned_shapes": body.shape as i64
                    }
                },
            )
            .await;

            HttpResponse::Ok().json(doc! {"bought": true})
        }
    }
}
