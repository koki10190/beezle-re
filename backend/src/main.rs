extern crate dotenv;
use actix_cors::Cors;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use dotenv::dotenv;
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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

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
    })
    .bind((env::var("ADDRESS").unwrap(), port))?
    .run();

    beezle::print("Started HTTP Server");

    http_server.await
}
