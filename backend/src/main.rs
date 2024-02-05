extern crate dotenv;
use actix_cors::Cors;
use actix_web::{get, middleware, post, web, App, HttpResponse, HttpServer, Responder};
use dotenv::dotenv;
use futures::StreamExt;
use mail_send::mail_builder::MessageBuilder;
use mail_send::{Credentials, SmtpClientBuilder};
use mongodb::options::Credential;
use serde::Deserialize;
use serde_json::ser;
use std::env;

use mongodb::bson::doc;
use mongodb::{options::ClientOptions, Client};

mod beezle;
mod mongoose;
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

    let http_server = HttpServer::new(move || {
        App::new()
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
            .service(routes::api::post::get::one::route)
            .service(routes::api::post::edit::route)
            .service(routes::api::post::get::profile::route)
            .service(routes::api::post::delete::route)
            .service(routes::api::user::follow::route)
            .service(routes::api::post::get::replies::route)
            .service(routes::api::post::get::reply_count::route)
            .service(routes::api::post::get::now::route)
            .route("/ws", web::get().to(ws::spawn::spawn))
            .wrap(middleware::Logger::default())
    })
    .bind((env::var("ADDRESS").unwrap(), port))?
    .run();

    beezle::print("Started HTTP Server");

    http_server.await
}
