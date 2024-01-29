use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

#[derive(Deserialize)]
pub struct EchoPrint {
    content: String,
}

#[post("/echo")]
pub async fn route(req_body: web::Json<EchoPrint>) -> impl Responder {
    let mut actual_string = "Content: ".to_owned();
    actual_string.push_str(&req_body.content);

    HttpResponse::Ok().body(actual_string)
}
