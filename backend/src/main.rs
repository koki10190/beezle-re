extern crate dotenv;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use dotenv::dotenv;
use serde::Deserialize;
use serde_json::ser;
use std::env;

// Routes
use mongodb::bson::doc;
use mongodb::{options::ClientOptions, Client};
mod beezle;
mod mongoose;
mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    beezle::print("Starting MongoDB Database");

    let client_options = ClientOptions::parse(env::var("MONGO_URI").unwrap())
        .await
        .unwrap();

    let client = Client::with_options(client_options).unwrap();

    beezle::print("Starting Server...");

    let port = env::var("PORT").unwrap().parse::<u16>().unwrap();

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(client.clone()))
            .service(routes::main_route::route)
            .service(routes::api::register_user::route)
    })
    .bind((env::var("ADDRESS").unwrap(), port))?
    .run()
    .await
}
