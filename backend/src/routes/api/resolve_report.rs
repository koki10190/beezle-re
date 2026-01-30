use bson::{doc, uuid, Document};
use futures::future::UnwrapOrElse;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use serde::Deserialize;
use std::env;

use actix_web::{get, http::StatusCode, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token, is_mod},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    report_id: String,
}

#[post("/api/resolve_report")]
pub async fn route(
    body: web::Json<GetUserQuery>,
    req: HttpRequest,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token = get_token(&req).unwrap();
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &token,
        &DecodingKey::from_secret(env::var("TOKEN_SECRET").unwrap().as_ref()),
        &Validation::default(),
    )
    .unwrap()
    .claims;

    let auth_doc = mongoose::get_document(
        &client,
        "beezle",
        "Users",
        doc! { "handle": &token_data.handle, "hash_password": &token_data.hash_password },
    )
    .await;

    if !is_mod(&client, token_data.handle.to_string()).await {
        return HttpResponse::Ok().json(doc! {"error": "User isn't a moderator!"});
    }

    let report_doc = mongoose::get_document(
        &client,
        "beezle",
        "Reports",
        doc! { "report_id": &body.report_id },
    )
    .await
    .unwrap();

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"error": "User not found!"}),
        _document => {
            let reporter = mongoose::get_document(
                &client,
                "beezle",
                "Users",
                doc! {
                    "handle": report_doc.get("reported_by").unwrap().as_str().unwrap()
                },
            )
            .await
            .unwrap();

            let mail = reporter.get("email").unwrap().as_str().unwrap();

            beezle::mail::send(
                mail,
                "Your report has been resolved",
                format!(
                    "Your report \"{}\" has been resolved by @{}",
                    body.report_id, &token_data.handle
                )
                .as_str(),
            )
            .await;

            mongoose::delete_document(
                &client,
                "beezle",
                "Reports",
                doc! {
                    "report_id": &body.report_id
                },
            )
            .await;

            HttpResponse::Ok().json(doc! {"message": "Report was resolved!"})
        }
    }
}
