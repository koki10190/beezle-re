use actix_ws::Session;

use crate::ws::structures::ws_data::WsData;

pub async fn send_back(session: &mut Session, data: WsData) {
    let _ = session
        .text(format!("{};:;;:;{}", data.channel, data.json_data))
        .await;
}
