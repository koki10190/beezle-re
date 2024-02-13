extern crate mongodb;
use bson::doc;
use mongodb::bson::Document;
use mongodb::Client;

use crate::beezle;

use super::{get_document, structures::user::UserLevels, update_document};

pub async fn add_coins(client: &Client, handle: &str, coins_to_add: i64) {
    update_document(
        client,
        "beezle",
        "Users",
        doc! {
            "handle": handle
        },
        doc! {
            "$inc": {
                "coins": coins_to_add
            }
        },
    )
    .await;
}

pub async fn get_coins(client: &Client, handle: &str) -> i64 {
    let user = get_document(
        client,
        "beezle",
        "Users",
        doc! {
            "handle": handle
        },
    )
    .await
    .unwrap();

    user.get("coins").unwrap().as_i64().unwrap()
}

pub async fn get_level(client: &Client, handle: &str) -> i64 {
    let user = get_document(
        client,
        "beezle",
        "Users",
        doc! {
            "handle": handle
        },
    )
    .await
    .unwrap();

    user.get("levels")
        .unwrap()
        .as_document()
        .unwrap()
        .get("level")
        .unwrap()
        .as_i64()
        .unwrap()
}
