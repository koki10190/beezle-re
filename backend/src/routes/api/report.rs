use bson::{doc, uuid, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
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
struct GetUserQuery {
    token: String,
    reporting: String,
    subject: String,
    context: String,
}

#[post("/api/report")]
pub async fn route(
    body: web::Json<GetUserQuery>,
    client: web::Data<mongodb::Client>,
) -> impl Responder {
    let token_data = decode::<mongoose::structures::user::JwtUser>(
        &body.token,
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

    match auth_doc {
        None => HttpResponse::Ok().json(doc! {"error": "User not found!"}),
        _document => {
            let report_struct = mongoose::structures::report::Report {
                id: None,
                report_id: uuid::Uuid::new().to_string(),
                reporting: body.reporting.to_string(),
                subject: body.subject.to_string(),
                context: body.context.to_string(),
                reported_by: token_data.handle.to_string(),
            };

            let ser_report_struct = mongodb::bson::to_bson(&report_struct).unwrap();
            let report_doc = ser_report_struct.as_document().unwrap();

            mongoose::insert_document(&client, "beezle", "Reports", report_doc.clone()).await;

            HttpResponse::Ok().json(doc! {"message": "Your report was received, you'll get notified when it gets resolved."})
        }
    }
}
