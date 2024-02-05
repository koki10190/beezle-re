use actix_ws::Session;
use serde::Deserialize;

use crate::{
    beezle,
    ws::{lib::send::send_back, structures::ws_data::WsData},
};

#[derive(Deserialize)]
struct ConnectionData {
    some_data: String,
}

pub async fn socket(data: WsData, session: &mut Session) {
    if data.channel != "connection" {
        return;
    }

    let m_data: ConnectionData = serde_json::from_str(&data.json_data).unwrap();

    beezle::print(&m_data.some_data);

    send_back(session, data).await;
}
