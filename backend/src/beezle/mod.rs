pub mod print;
use std::{collections::HashMap, sync::{Arc, Mutex}};

use actix_web::web;
use bson::{doc, Document};
use mongodb::Client;
pub use print::print;

use crate::mongoose::{self};

pub mod crypt;

pub mod mail;
pub mod mongo;
pub mod auth;

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

pub async fn send_socket_to_user(ws_sessions: &web::Data<Arc<Mutex<HashMap<String, actix_ws::Session>>>>, handle: &str, channel: &str, data: Document) {
    let locked = ws_sessions.lock();
                    
    match locked {
        Ok(mut sessions) => {
            let option_to = sessions.get_mut(handle);

            let final_data = doc! {
                "channel": channel,
                "data": data
            };

            if let Some(to_session) = option_to {
                let _ = to_session.text(serde_json::to_string(&final_data).unwrap()).await;
            }
        }
        Err(err) => {
            println!("Poisont error: {:?}", err);
        }
    }
}


pub async fn ws_send_notification(ws_sessions: &web::Data<Arc<Mutex<HashMap<String, actix_ws::Session>>>>, handle: &str, data: Option<Document>) {
    let empty = doc! {
    };

    send_socket_to_user(&ws_sessions, handle, "update_notification_counter", if data.is_some() {data.unwrap()} else {empty}).await;
}

pub fn is_user_online(ws_sessions: &web::Data<Arc<Mutex<HashMap<String, actix_ws::Session>>>>, handle: &str) -> bool {
    let arc_clone = ws_sessions.get_ref();
    let locked = arc_clone.lock();
                    
    match locked {
        Ok(mut sessions) => {
            let option_to = sessions.get_mut(handle);

            if let Some(to_session) = option_to {
                return true
            }

            false
        }
        Err(err) => {
            println!("Poisont error: {:?}", err);
            false
        }
    }
}