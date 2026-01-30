use actix_web::HttpRequest;
use bson::doc;
use jsonwebtoken::{decode, DecodingKey, TokenData, Validation};
use lastfm::client;
use mail_send::mail_builder::MessageBuilder;
use mail_send::{Credentials, SmtpClientBuilder};
use mongodb::Client;
use password_hash::rand_core::block;
use std::env;

use crate::mongoose;
use crate::mongoose::structures::user::JwtUser;

pub fn get_token(req: &HttpRequest) -> Option<String> {
    let header = req.headers().get("Authorization");

    match header {
        Some(auth) => {
            let token = auth.to_str();

            match token {
                Ok(token_string) => Some(token_string.to_string()),
                Err(err) => {
                    println!("Couldn't convert AUTH Header to string: {:?}", err);
                    None
                }
            }
        }
        None => None
    }
}

pub async fn check_if_blocked(client: &Client, who: &str, by: &str) -> bool {
    let blocked_user = mongoose::get_document(&client, "beezle", "BlockedUsers", doc!{
        "who": who,
        "by": by
    }).await;
    
    match blocked_user {
        Some(_) => return true,
        None => return false
    };
}

pub async fn get_users_that_blocked_as_vec(client: &Client, handle: &str) -> Vec<String> {
    let blocked_users = mongoose::get_many_document(&client, "beezle", "BlockedUsers", doc!{
        "who": handle
    }).await;

    let mut vec_blocked_users: Vec<String> = vec![];

    for blocked_user in blocked_users {
        vec_blocked_users.push(blocked_user.get("by").unwrap().as_str().unwrap().to_string());
    }

    vec_blocked_users
}

pub async fn get_blocked_users_as_vec(client: &Client, handle: &str) -> Vec<String> {
    let blocked_users = mongoose::get_many_document(&client, "beezle", "BlockedUsers", doc!{
        "by": handle
    }).await;

    let mut vec_blocked_users: Vec<String> = vec![];

    for blocked_user in blocked_users {
        vec_blocked_users.push(blocked_user.get("who").unwrap().as_str().unwrap().to_string());
    }

    vec_blocked_users
}

pub fn get_token_data(client: &Client, req: &HttpRequest) -> Result<TokenData<JwtUser>, jsonwebtoken::errors::Error> {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &get_token(&req).unwrap(),
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    );

    token_data
}

pub async fn verify_token(client: &Client, req: &HttpRequest) -> bool {
    let token_option = get_token(req);

    match token_option {
        Some(token_str) => {
            let token = decode::<mongoose::structures::user::JwtUser>(
                &token_str,
                &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
                &Validation::default(),
            );

            if let Err(err) = token {
                return false
            }

            if let Ok(token_data) = token {
                let user = mongoose::get_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {
                        "handle": token_data.claims.handle,
                        "email": token_data.claims.email,
                    },
                ).await;

                if let Some(_) = user {
                    return true;
                }

                return false
            }
        }
        None => (),
    }

    false
}