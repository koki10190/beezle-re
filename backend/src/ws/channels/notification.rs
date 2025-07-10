use actix_ws::Session;
use bson::doc;
use mail_send::mail_auth::common::resolver;
use serde::Deserialize;
use std::collections::HashMap;

use crate::{
    beezle,
    data_struct::AppData,
    mongoose,
    ws::{
        lib::send::send_back,
        structures::{
            notification_data::WsNotificationData, user_data::WsUserData, ws_data::WsData,
        },
    },
};

pub async fn socket(
    data: WsData,
    session: &mut Session,
    sessions: &mut HashMap<String, actix_ws::Session>,
    client: &mongodb::Client,
) -> String {
    if data.channel != "notification" {
        return "".to_string();
    }

    beezle::print("WEB SOCKET HANDLING:");
    beezle::print(&data.json_data);

    let m_data: WsNotificationData = serde_json::from_str(&data.json_data).unwrap();

    beezle::print("Called channel: Notification");
    beezle::print(&m_data.post.handle);

    if let Some(receiver_session) = sessions.get_mut(&m_data.post.handle) {
        beezle::print("Found receiver");
        let data = WsData {
            channel: "get-notif".to_string(),
            json_data: serde_json::to_string(&doc! {
                "caller": &m_data.handle,
                "post_id": &m_data.post.post_id,
                "message": &m_data.message
            })
            .unwrap(),
        };
        send_back(receiver_session, data).await;
    }

    // mongoose::update_document(
    //     &client,
    //     "beezle",
    //     "Users",
    //     doc! {
    //         "handle": &m_data.post.handle
    //     },
    //     doc! {
    //         "$addToSet": {
    //             "notifications": {
    //                 "caller": &m_data.handle,
    //                 "post_id": &m_data.post.post_id,
    //                 "message": &m_data.message
    //             }
    //         }
    //     },
    // )
    // .await;

    m_data.handle
}
