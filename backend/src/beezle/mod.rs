pub mod print;
use bson::doc;
use mongodb::Client;
pub use print::print;

use crate::mongoose::{self};

pub mod crypt;

pub mod mail;
pub mod mongo;

pub fn rem_first_and_last(value: &str) -> &str {
    let mut chars = value.chars();
    chars.next();
    chars.next_back();
    chars.as_str()
}

pub async fn is_mod(client: &Client, handle: String) -> bool {
    let document = mongoose::get_document(client, "beezle", "Users", doc! {"handle": handle})
        .await
        .unwrap();

    let badges = document.get_array("badges").unwrap();

    for badge in badges {
        let num = badge.as_i64().unwrap();

        if num == 2 {
            return true;
        }
    }

    false
}

pub async fn is_owner(client: &Client, handle: String) -> bool {
    let document = mongoose::get_document(client, "beezle", "Users", doc! {"handle": handle})
        .await
        .unwrap();

    let badges = document.get_array("badges").unwrap();

    for badge in badges {
        let num = badge.as_i64().unwrap();

        if num == 3 {
            return true;
        }
    }

    false
}


pub async fn user_exists(client: &Client, handle: String) -> bool {
    let document = mongoose::get_document(client, "beezle", "Users", doc! {"handle": handle})
        .await;
     
    match document {
        None => false,
        _document => true
    }
}
