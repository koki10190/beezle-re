use bson::{doc, uuid, Document};
use futures::TryStreamExt;
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::options::AggregateOptions;
use regex::Regex;
use serde::Deserialize;
use std::env;

use actix_web::{body, get, http::StatusCode, patch, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};

use crate::{
    beezle::{self, auth::get_token},
    mongoose::{self, structures::{dm_msg::MESSAGE_FETCH_OFFSET, user}},
    poison::LockResultExt,
};

#[derive(Deserialize)]
struct GetUserQuery {
    avatar: String,
    name: String,
    members: String
}

#[post("/api/dms/create_gc")]
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

    let members_arr: Vec<String> = body.members.clone().split(", ").map(|s| s.to_string()).collect();
    let id = uuid::Uuid::new().to_string();

    let regex = Regex::new(r"\b^https?:\/\/i\.imgur\.com\S+").unwrap();
    if !regex.is_match(&body.avatar) {
        return HttpResponse::Ok().json(doc! {"error": "Only Imgur links are allowed for safety reasons! You dirty ass fucking hacker, eat shit faggot"});
    }

    let token_user = mongoose::get_document(&client, "beezle", "Users", doc!{
        "handle": &token_data.handle,
        "email": &token_data.email
    }).await.unwrap();

    let following = token_user.get_array("following").unwrap();
    let followers = token_user.get_array("followers").unwrap();

    let mut actual_members: Vec<String> = vec![];

    for follower in followers {
        let strf = follower.as_str().unwrap();

        for member in &members_arr {
            if strf == member {
                actual_members.push(member.clone());
            }
        }
    }

    mongoose::insert_document(&client, "beezle", "DmGroupChats", doc! {
        "owner": &token_data.handle,
        "group_id": &id,
        "members": actual_members,
        "name": &body.name,
        "avatar": &body.avatar,
        "creation_date": chrono::Utc::now()
    }).await;

    let selecid = uuid::Uuid::new().to_string();
    mongoose::insert_document(&client, "beezle", "DmSelections", doc! {
        "is_group": true,
        "group_id": &id,
        "belongs_to": &token_data.handle,
        "selection_id": selecid.clone()
    }).await;
    
    HttpResponse::Ok().json(doc! {
        "message": "Done!",
        "group_id": id,
        "selection_id": selecid
    })
}
