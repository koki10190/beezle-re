use bson::{doc, Document};
use jsonwebtoken::{decode, DecodingKey, EncodingKey, Header, Validation};
use mail_send::mail_auth::flate2::Status;
use mongodb::Client;
use serde::{Deserialize, Serialize};
use std::env;
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

#[derive(Deserialize)]
struct SteamBody {
    steam_id: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PlayerSummaries {
    pub steamid: String,
    pub personaname: String,
    pub profileurl: String,
    pub avatar: String,
    pub avatarmedium: String,
    pub avatarfull: String,
    pub avatarhash: Option<String>,
    pub personastate: Option<i32>,
    pub personastateflags: Option<i32>,
    pub communityvisibilitystate: u32,
    pub profilestate: Option<i32>,
    pub lastlogoff: Option<i64>,
    pub commentpermission: Option<u32>,
    pub realname: Option<String>,
    pub primaryclanid: Option<String>,
    pub timecreated: Option<u64>,
    pub gameid: Option<String>,
    pub gameserverip: Option<String>,
    pub gameextrainfo: Option<String>,
    pub cityid: Option<i64>,
    pub loccountrycode: Option<String>,
    pub locstatecode: Option<String>,
    pub loccityid: Option<i64>,
}

#[derive(Deserialize)]
struct SummariesPlayers {
    players: Vec<PlayerSummaries>,
}

#[derive(Deserialize)]
struct SummariesResponse {
    response: SummariesPlayers,
}

pub async fn get_steam_playing_now(steam_id: &str) -> Result<Document, bson::ser::Error> {
    let client = reqwest::Client::new();
    let response = client
        .get("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/")
        .query(&[
            ("key", env::var("STEAM_API_KEY").unwrap().as_str()),
            ("steamids", steam_id),
        ])
        .send()
        .await
        .unwrap()
        .json::<SummariesResponse>()
        .await
        .unwrap();

    let player = response.response.players.first().unwrap();

    let gameid = &player.gameid;
    let mut game_response = "{}".to_string();

    if gameid.is_some() {
        game_response = client
            .get("http://store.steampowered.com/api/appdetails")
            .query(&[("appids", gameid.clone().unwrap())])
            .send()
            .await
            .unwrap()
            .text()
            .await
            .unwrap();
    }
    println!("{}", game_response);
    let serde_value = serde_json::from_str::<serde_json::Value>(&game_response).expect("Invalid Response");
    bson::to_document(&serde_value)
}

#[get("/api/connections/steam_get_game")]
pub async fn route(
    body: web::Query<SteamBody>,
    client: web::Data<Client>,
    req: HttpRequest
) -> actix_web::Result<HttpResponse> {
    if !verify_token(&client, &req).await {
        return Ok(HttpResponse::Unauthorized().json(doc!{"error": "Not Authorized!"}));
    }

    let client = reqwest::Client::new();
    let response = client
        .get("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/")
        .query(&[
            ("key", env::var("STEAM_API_KEY").unwrap().as_str()),
            ("steamids", body.steam_id.as_str()),
        ])
        .send()
        .await
        .unwrap()
        .json::<SummariesResponse>()
        .await
        .unwrap();

    let player = response.response.players.first().unwrap();

    let gameid = &player.gameid;
    let mut game_response = "".to_string();

    if gameid.is_some() {
        game_response = client
            .get("http://store.steampowered.com/api/appdetails")
            .query(&[("appids", gameid.clone().unwrap())])
            .send()
            .await
            .unwrap()
            .text()
            .await
            .unwrap();
    }

    Ok(HttpResponse::Ok().body(game_response))
}
