extern crate dotenv;
use actix_cors::Cors;
use actix_web::body::MessageBody;
use actix_web::{get, middleware, post, web, App, HttpResponse, HttpServer, Responder};
use actix_web_middleware_redirect_https::RedirectHTTPS;
use aes_gcm::aead::Aead;
use aes_gcm::{AeadCore, Aes256Gcm, Key, KeyInit};
use base64::engine::general_purpose;
use base64::Engine;
use dotenv::dotenv;
use futures::StreamExt;
use mail_send::mail_builder::MessageBuilder;
use mail_send::{Credentials, SmtpClientBuilder};
use mongodb::options::Credential;
use openssl::{encrypt};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use rand::rngs::OsRng;
use serde::Deserialize;
use serde_json::ser;
use socketioxide::extract::Data;
use std::collections::HashMap;
use std::{env, str};
use std::sync::Mutex;

use mongodb::bson::doc;
use mongodb::{options::ClientOptions, Client};

use crate::routes::ws::socket;

mod beezle;
mod data_struct;
mod mongoose;
mod poison;
mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    println!(
        "{}",
        env::var("GMAIL_MAIL").unwrap().as_str(),
        // env::var("MAIL_PASSWORD").unwrap().as_str()
    );

    // beezle::mail::send("john@example.com", "Subject", "Body").await;

    beezle::print("Starting MongoDB Database...");

    let client_options = ClientOptions::parse(env::var("MONGO_URI").unwrap())
        .await
        .unwrap();

    beezle::print("Started MongoDB Database");

    let client = Client::with_options(client_options).unwrap();
    mongoose::create_collection(&client, "beezle", "Users").await;
    mongoose::create_collection(&client, "beezle", "Reactions").await;
    mongoose::create_collection(&client, "beezle", "Auths").await;
    mongoose::create_collection(&client, "beezle", "Posts").await;

    beezle::print("Starting HTTP Server...");

    let port = env::var("PORT").unwrap().parse::<u16>().unwrap();

    let app_data = data_struct::AppData {
        client: client.clone(),
        connections: HashMap::new(),
    };    
    let mutex_app_data = web::Data::new(Mutex::new(app_data));

    beezle::print(beezle::crypt::hash_password("password123").as_str());

    let pass = "PASSWORD4343434".to_string();
    let data = "Hello, my cryptobros.";
    
    let encrypted_data = beezle::crypt::encrypt(data, pass.as_str()).unwrap();
    let encoded_data = general_purpose::STANDARD.encode(&encrypted_data);
    // beezle::print(format!("Encrypted Data: {:?}", encoded_data).as_str());
    let decrypted_data = beezle::crypt::decrypt("JQAAAAAAAACbgLPFY+veB5os8jfU0KV2op56oIBhzfQrC39olpB88L+g2TGjsR6/onG8afOsoTlAWG46MtAP44Pwtt/sC8avG4feALjb8VowXfzxlUlTXqc=", pass.as_str()).unwrap();
    beezle::print(format!("Decrypted Data: {}", String::from_utf8(decrypted_data).unwrap()).as_str());


    // let pass = env::var("ENCRYPT_PASSWORD").unwrap();
    // let password = pass.as_bytes();
    // let key: &Key<Aes256Gcm> = password.into();
    // let cipher = Aes256Gcm::new(&key);
    // let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    // let data = "This is a message".as_bytes();
    // let encrypted_data = match cipher.encrypt(&nonce, data) {
    //     Ok(encrpted) => {
    //         beezle::print(format!("{:?}", encrpted).as_str());
    //         beezle::print(format!("{:?}", base64::encode_block(&encrpted)).as_str());
    //     }
    //     Err(err) => {
    //         beezle::print("retarded error detected");
    //     }
    // };

    let ws_session_map: web::Data<Mutex<HashMap<String, actix_ws::Session>>> = web::Data::new(Mutex::new(HashMap::new()));

    let http_server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::clone(&mutex_app_data))
            .app_data(web::Data::new(client.clone()))
            .app_data(web::Data::clone(&ws_session_map))
            .wrap(Cors::permissive())
            .service(routes::main_route::route)
            .service(routes::api::register_user::route)
            .service(routes::api::verification::route)
            .service(routes::api::get_user::route)
            .service(routes::api::get_user_public::route)
            .service(routes::api::is_verified::route)
            .service(routes::api::login_user::route)
            .service(routes::api::change_avatar::route)
            .service(routes::api::change_banner::route)
            .service(routes::api::change_username::route)
            .service(routes::api::edit_profile::route)
            .service(routes::api::get_user_many::route)
            .service(routes::api::post::create::route)
            .service(routes::api::post::search::route)
            .service(routes::api::post::get::explore::route)
            .service(routes::api::post::like::route)
            .service(routes::api::post::repost::route)
            .service(routes::api::post::bookmark::route)
            .service(routes::api::post::pin::route)
            .service(routes::api::post::get::one::route)
            .service(routes::api::post::edit::route)
            .service(routes::api::post::get::profile::route)
            .service(routes::api::post::get::reacts::route)
            .service(routes::api::post::delete::route)
            .service(routes::api::user::follow::route)
            .service(routes::api::post::get::replies::route)
            .service(routes::api::post::get::reply_count::route)
            .service(routes::api::post::get::now::route)
            .service(routes::api::user::clear_notifs::route)
            .service(routes::api::user::delete::route)
            .service(routes::api::user::change_password::route)
            .service(routes::api::verify_pass::route)
            .service(routes::api::get_reports::route)
            .service(routes::api::report::route)
            .service(routes::api::resolve_report::route)
            .service(routes::api::user::ban::route)
            .service(routes::api::post::mod_delete::route)
            .service(routes::api::post::get::following::route)
            .service(routes::api::user::buy::profile_gradient::route)
            .service(routes::api::user::buy::name_color::route)
            .service(routes::api::user::buy::square_avatar::route)
            .service(routes::api::user::buy::profile_postbox_img::route)
            .service(routes::api::user::upload_emoji::route)
            .service(routes::api::user::mod_verify::route)
            .service(routes::api::connections::steam_auth::route)
            .service(routes::api::connections::steam_get::route)
            .service(routes::api::connections::steam_get_game::route)
            .service(routes::api::connections::steam_disconnect::route)
            .service(routes::api::connections::spotfiy_auth::route)
            .service(routes::api::connections::spotfiy_disconnect::route)
            .service(routes::api::connections::spotify_refresh_token::route)
            .service(routes::api::connections::spotify_status::route)
            .service(routes::api::lastfm::now_playing::route)
            .service(routes::api::lastfm::set_username::route)
            .service(routes::api::lastfm::remove_username::route)
            .service(routes::api::post::react::route)
            .route("/ws", web::get().to(socket::ws))
            // .wrap(middleware::Logger::default())
    });

    beezle::print("Started HTTP Server");
    if env::var("USE_SSL").unwrap() == "yes" {
        let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
        builder
            .set_private_key_file("priv.key", SslFiletype::PEM)
            .unwrap();
        builder.set_certificate_chain_file("cert.crt").unwrap();

        http_server
            .bind_openssl((env::var("ADDRESS").unwrap(), port), builder)?
            .run()
            .await
    } else {
        http_server
            .bind((env::var("ADDRESS").unwrap(), port))?
            .run()
            .await
    }
}
