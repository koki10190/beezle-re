extern crate dotenv;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use dotenv::dotenv;
use serde::Deserialize;
use std::env;

// Routes
mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    println!("Running...");

    let port = env::var("PORT").unwrap().parse::<u16>().unwrap();

    HttpServer::new(|| {
        App::new()
            .service(routes::main_route::route)
            .service(routes::echo::route)
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}
