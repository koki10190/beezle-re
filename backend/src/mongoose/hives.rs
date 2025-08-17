extern crate mongodb;
use bson::doc;
use mongodb::bson::Document;
use mongodb::Client;

use crate::beezle;

use super::{get_document, structures::user::UserLevels, update_document};

pub const GOLD_RUSH: bool = false;
pub const GOLD_RUSH_MULTIPLYER: i64 = 2;

pub async fn add_coins(client: &Client, hive_id: &str, coins_to_add: i64) {
    let mut mut_coins_to_add = coins_to_add;
    
    // -100 so that the shop shit wont be affected.
    if GOLD_RUSH && (mut_coins_to_add > 0 || mut_coins_to_add > -100) {
        mut_coins_to_add *= GOLD_RUSH_MULTIPLYER;
    }

    update_document(
        client,
        "beezle",
        "Users",
        doc! {
            "$or": [
                doc! {
                    "handle":  mongodb::bson::Regex {
                        pattern: hive_id.replace("@", "").to_string(),
                        options: "i".to_string()
                    }
                },
                doc! {
                    "hive_id": &hive_id
                },
            ]
        },
        doc! {
            "$inc": {
                "coins": mut_coins_to_add
            }
        },
    )
    .await;
}

pub async fn add_xp(client: &Client, hive_id: &str, xp_to_add: i64) {
    let mut mut_xp_to_add = xp_to_add;
    
    // -100 so that the shop shit wont be affected.
    if GOLD_RUSH && (mut_xp_to_add > 0 || mut_xp_to_add > -100) {
        mut_xp_to_add *= GOLD_RUSH_MULTIPLYER;
    }

    update_document(
        client,
        "beezle",
        "Users",
        doc! {
            "$or": [
                doc! {
                    "handle":  mongodb::bson::Regex {
                        pattern: hive_id.replace("@", "").to_string(),
                        options: "i".to_string()
                    }
                },
                doc! {
                    "hive_id": &hive_id
                },
            ]
        },
        doc! {
            "$inc": {
                "levels.xp": mut_xp_to_add
            }
        },
    )
    .await;

    let hive = get_document(
        client,
        "beezle",
        "Hives",
        doc! {
            "$or": [
                doc! {
                    "handle":  mongodb::bson::Regex {
                        pattern: hive_id.replace("@", "").to_string(),
                        options: "i".to_string()
                    }
                },
                doc! {
                    "hive_id": &hive_id
                },
            ]
        },
    )
    .await
    .unwrap();

    let string_repr = serde_json::to_string(hive.get("levels").unwrap()).unwrap();
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
            "$or": [
                doc! {
                    "handle":  mongodb::bson::Regex {
                        pattern: hive_id.replace("@", "").to_string(),
                        options: "i".to_string()
                    }
                },
                doc! {
                    "hive_id": &hive_id
                },
            ]
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