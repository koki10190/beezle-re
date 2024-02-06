use bson::{doc, Document};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    mongoose::{self, structures::user},
};

#[derive(Deserialize)]
struct AuthQuery {
    auth_id: String,
}

#[get("/api/verify")]
pub async fn route(
    params: web::Query<AuthQuery>,
    app: web::Data<std::sync::Mutex<crate::data_struct::AppData>>,
) -> impl Responder {
    let mut app_data = app.lock().unwrap();

    let auth_doc = mongoose::get_document(
        &app_data.client,
        "beezle",
        "Auths",
        doc! { "auth_id": &params.auth_id },
    )
    .await;

    match auth_doc {
        None => HttpResponse::Ok().body("Not Found"),
        _document => {
            let mut handle = _document
                .clone()
                .unwrap()
                .get("handle")
                .unwrap()
                .to_string();
            handle = beezle::rem_first_and_last(&handle).to_string();

            let mut email = _document.clone().unwrap().get("email").unwrap().to_string();
            email = beezle::rem_first_and_last(&email).to_string();

            let user_doc = mongoose::get_document(
                &app_data.client,
                "beezle",
                "Auths",
                doc! {
                    "handle": &handle,
                    "email": &email
                },
            )
            .await;

            if user_doc.is_some() {
                mongoose::update_document(
                    &app_data.client,
                    "beezle",
                    "Users",
                    doc! {"handle": &handle, "email": &email},
                    doc! {"$set": {"verified": true}},
                )
                .await;

                beezle::mail::send(
                    email.as_str(),
                    "Your account has been verified!",
                    format!(
                    "Your account \"{}\" has been verified, you can now login using your account.",
                    handle.as_str()
                )
                    .as_str(),
                )
                .await;
            }

            mongoose::delete_document(
                &app_data.client,
                "beezle",
                "Auths",
                doc! { "auth_id": &params.auth_id },
            )
            .await;

            HttpResponse::Ok().body(format!(
                "Your account \"{}\" has been authenticated!",
                handle.as_str()
            ))
        }
    }
}
