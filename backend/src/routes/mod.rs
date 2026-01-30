use serde::Deserialize;
use std::env;

use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

pub mod api;
pub mod main_route;
pub mod ws;