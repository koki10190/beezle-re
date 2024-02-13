extern crate dotenv;
use actix_cors::Cors;
use actix_web::{get, middleware, post, web, App, HttpResponse, HttpServer, Responder};
use actix_web_middleware_redirect_https::RedirectHTTPS;
use dotenv::dotenv;
use futures::StreamExt;
use mail_send::mail_builder::MessageBuilder;
use mail_send::{Credentials, SmtpClientBuilder};
use mongodb::options::Credential;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use serde::Deserialize;
use serde_json::ser;
use socketioxide::extract::Data;
use std::collections::HashMap;
use std::env;
use std::sync::Mutex;

use mongodb::bson::doc;
use mongodb::{options::ClientOptions, Client};

mod beezle;
mod data_struct;
mod mongoose;
mod poison;
mod routes;
mod ws;

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
    mongoose::create_collection(&client, "beezle", "Auths").await;
    mongoose::create_collection(&client, "beezle", "Posts").await;

    beezle::print("Starting HTTP Server...");

    let port = env::var("PORT").unwrap().parse::<u16>().unwrap();

    let app_data = data_struct::AppData {
        client: client.clone(),
        connections: HashMap::new(),
    };
    let session_map: HashMap<String, actix_ws::Session> = HashMap::new();
    let mutex_app_data = web::Data::new(Mutex::new(app_data));

    let http_server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::clone(&mutex_app_data))
            .app_data(web::Data::new(client.clone()))
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
            .service(routes::api::post::get::explore::route)
            .service(routes::api::post::like::route)
            .service(routes::api::post::repost::route)
            .service(routes::api::post::bookmark::route)
            .service(routes::api::post::pin::route)
            .service(routes::api::post::get::one::route)
            .service(routes::api::post::edit::route)
            .service(routes::api::post::get::profile::route)
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
            .service(routes::api::connections::steam_auth::route)
            .service(routes::api::connections::steam_get::route)
            .service(routes::api::connections::steam_get_game::route)
            .service(routes::api::connections::steam_disconnect::route)
            .route("/ws", web::get().to(ws::spawn::spawn))
            .wrap(middleware::Logger::default())
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
