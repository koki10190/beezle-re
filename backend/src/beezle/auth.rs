use actix_web::HttpRequest;
use mail_send::mail_builder::MessageBuilder;
use mail_send::{Credentials, SmtpClientBuilder};
use std::env;

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