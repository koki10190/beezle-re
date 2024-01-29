use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

#[get("/")]
pub async fn route() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}
