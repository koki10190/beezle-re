extern crate mongodb;
use bson::doc;
use mongodb::bson::Document;
use mongodb::Client;

use crate::beezle;

use super::{get_document, structures::user::UserLevels, update_document};

pub async fn add_xp(client: &Client, handle: &str, xp_to_add: i64) {
    update_document(
        client,
        "beezle",
        "Users",
        doc! {
            "handle": handle
        },
        doc! {
            "$inc": {
                "levels.xp": xp_to_add
            }
        },
    )
    .await;

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

    let string_repr = serde_json::to_string(user.get("levels").unwrap()).unwrap();
    let mut levels: UserLevels = serde_json::from_str(&string_repr).unwrap();

    if levels.xp >= 1000 {
        levels.xp = 0;
        levels.level += 1;
    }
    beezle::print(format!("{} {}", levels.xp, levels.level).as_str());

    update_document(
        client,
        "beezle",
        "Users",
        doc! {
            "handle": handle
        },
        doc! {
            "$set": {
                "levels": {
                    "level": levels.level,
                    "xp": levels.xp
                }
            }
        },
    )
    .await;
}
