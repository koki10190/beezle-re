use bson::{doc, Document};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpResponse, HttpServer, Responder};

use crate::{
    beezle,
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct AuthQuery {
    auth_id: String,
}

#[get("/api/verify_pass")]
pub async fn route(
    params: web::Query<AuthQuery>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let auth_doc = mongoose::get_document(
        &client,
        "beezle",
        "ChangePassAuths",
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
                &client,
                "beezle",
                "ChangePassAuths",
                doc! {
                    "handle": &handle,
                    "email": &email
                },
            )
            .await;

            if user_doc.is_some() {
                mongoose::update_document(
                    &client,
                    "beezle",
                    "Users",
                    doc! {"handle": &handle, "email": &email},
                    doc! {"$set": {"hash_password": _document.unwrap().get("hash_password").unwrap().as_str().unwrap()}},
                )
                .await;

                beezle::mail::send(
                    email.as_str(),
                    "Your accounts password has been changed",
                    format!("Your account \"{}\" password was changed.", handle.as_str()).as_str(),
                )
                .await;
            }

            mongoose::delete_document(
                &client,
                "beezle",
                "ChangePassAuths",
                doc! { "auth_id": &params.auth_id },
            )
            .await;

            HttpResponse::Ok().body(format!(
                "Your password for account \"{}\" has been changed.",
                handle.as_str()
            ))
        }
    }
}
