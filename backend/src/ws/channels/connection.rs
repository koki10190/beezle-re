use actix_ws::Session;
use bson::doc;
use serde::Deserialize;
use std::collections::HashMap;

use crate::{
    beezle,
    data_struct::AppData,
    ws::{
        lib::send::send_back,
        structures::{user_data::WsUserData, ws_data::WsData},
    },
};

pub async fn socket(data: WsData, session: &mut Session) -> String {
    if data.channel != "connection" {
        return "".to_string();
    }

    let m_data: WsUserData = serde_json::from_str(&data.json_data).unwrap();

    beezle::print(format!("CONNECTION SECURED: {}", &m_data.handle).as_str());

    send_back(
        session,
        WsData {
            channel: "connected".to_string(),
            json_data: serde_json::to_string(&doc! {"message": "Connected"}).unwrap(),
        },
    )
    .await;

    m_data.handle
}
