use bson::doc;
use mongodb::Client;

use crate::{beezle, mongoose};

pub async fn add_post_notif(client: &Client, to: String, caller: String, message: String, post_id: String) -> bool {
    beezle::print(format!("To: {}", to).as_str());
    mongoose::update_document(
        &client,
        "beezle",
        "Users",
        doc! {
            "handle": &to
        },
        doc! {
            "$addToSet": {
                "notifications": {
                    "caller": &caller,
                    "post_id": &post_id,
                    "message": &message
                }
            }
        },
    ).await;

    true
}


pub async fn add_profile_notif(client: &Client, to: String, caller: String, message: String, handle: String) -> bool {
    mongoose::update_document(
        &client,
        "beezle",
        "Users",
        doc! {
            "handle": &to
        },
        doc! {
            "$addToSet": {
                "notifications": {
                    "caller": &caller,
                    "handle": &handle,
                    "message": message
                }
            }
        },
    ).await;

    true
}
