use actix_multipart::{form::{json::Json, tempfile::TempFile, MultipartForm}, Multipart};
use bson::{doc, Document, Uuid};
use futures::StreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::Client;
use reqwest::{Body};
use reqwest::multipart;

use serde::{Deserialize, Serialize};
use tokio::{fs::File, io::AsyncWriteExt};
use tokio_util::codec::{BytesCodec, FramedRead};
use std::{env, fs, io::Read};
use steam_connect::Verify;

use actix_web::{
    get,
    http::{header::QualityItem, StatusCode},
    post,
    web::{self, Query},
    App, HttpRequest, HttpResponse, HttpServer, Responder,
};

use crate::{
    beezle::{self, auth::verify_token},
    mongoose::{self, structures::user},
    poison::LockResultExt,
};

// #[derive(Deserialize)]
// struct SteamQuery {
//     #[serde(rename = "openid.ns")]
//     ns: String,
//     #[serde(rename = "openid.mode")]
//     mode: String,
//     #[serde(rename = "openid.op_endpoint")]
//     op_endpoint: String,
//     #[serde(rename = "openid.claimed_id")]
//     claimed_id: String,
//     #[serde(rename = "openid.identity")]
//     identity: String,
//     #[serde(rename = "openid.return_to")]
//     return_to: String,
//     #[serde(rename = "openid.response_nonce")]
//     response_nonce: String,
//     #[serde(rename = "openid.invalidate_handle")]
//     invalidate_handle: Option<String>,
//     #[serde(rename = "openid.assoc_handle")]
//     assoc_handle: String,
//     #[serde(rename = "openid.signed")]
//     signed: String,
//     #[serde(rename = "openid.sig")]
//     sig: String,
// }


#[derive(Debug, MultipartForm)]
struct UploadForm {
    #[multipart(limit = "15MB")]
    image: TempFile,
}

#[post("/api/file/upload")]
pub async fn route(
    MultipartForm(body): MultipartForm<UploadForm>,
    client: web::Data<Client>,
    req: HttpRequest
) -> actix_web::Result<HttpResponse> {
    if !verify_token(&client, &req).await {
        return Ok(HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"}));
    }

    println!("Filename: {}", body.image.file_name.unwrap());

    // Get full file data
    // let mut file: tokio::fs::File = tokio::fs::File::create(format!("./{}",Uuid::new())).await?;
    // while let Some(field) = body.next().await {
    //     let mut field = match field {
    //         Ok(field) => field,
    //         Err(e) => return Err(actix_web::error::ErrorBadRequest(e.to_string())),
    //     };

    //     if field.name() == "file" {
    //         while let Some(chunk) = field.next().await {
    //             let chunk = match chunk {
    //                 Ok(chunk) => chunk,
    //                 Err(e) => return Err(actix_web::error::ErrorBadRequest(e.to_string()))
    //             };

    //             let _ = file.write_all(&chunk).await?;
    //         }
    //     }

    // }
    let mut _file = body.image.file;
    
    let tokio_file = File::open(_file.path().as_os_str().to_str().unwrap()).await.unwrap();
    let stream = FramedRead::new(tokio_file, BytesCodec::new());
    let file_body = Body::wrap_stream(stream);

    let form_file = multipart::Part::stream(file_body)
        .file_name(format!("{}", _file.path().file_name().unwrap().to_str().unwrap()));

    let form = multipart::Form::new()
        .part("image", form_file);

    let client = reqwest::Client::new();
    let response = client
        .post("https://api.imgur.com/3/image").header("Authorization", "Client-ID cd2bc7a0a6fcd47")
        .multipart(form).send().await;

    match response {
        Ok(res) => {
            let json: serde_json::Value = res.json().await.unwrap();
            return Ok(HttpResponse::Ok().json(json));
        }
        Err(err) => {
            println!("{:?}", err);
            return Ok(HttpResponse::BadRequest().body("Failed to upload"));
        }
    }
}
 