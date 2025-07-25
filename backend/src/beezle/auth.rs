use actix_web::HttpRequest;
use bson::doc;
use jsonwebtoken::{decode, DecodingKey, Validation};
use mail_send::mail_builder::MessageBuilder;
use mail_send::{Credentials, SmtpClientBuilder};
use mongodb::Client;
use std::env;

use crate::mongoose;

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