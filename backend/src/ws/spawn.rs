use std::any::Any;
use std::collections::HashMap;
use std::sync::Mutex;

use actix_web::web;
use actix_web::HttpResponse;
use futures::StreamExt;

use crate::beezle;
use crate::data_struct::AppData;
use crate::ws::channels;

use super::lib::send::send_back;
use super::structures::ws_data::WsData;

pub async fn spawn(
    req: actix_web::HttpRequest,
    body: web::Payload,
    fapp: web::Data<std::sync::Mutex<crate::data_struct::AppData>>,
    client: web::Data<mongodb::Client>,
) -> Result<HttpResponse, actix_web::Error> {
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, body)?;

    let mut stored_sessions: HashMap<String, actix_ws::Session> = HashMap::new();

    actix_rt::spawn(async move {
        // let mut app_data = app.lock().unwrap();
        let mut current_session_handle: String = "".to_string();
        while let Some(Ok(msg)) = msg_stream.next().await {
            match msg {
                actix_ws::Message::Ping(bytes) => {
                    if session.pong(&bytes).await.is_err() {
                        return;
                    }
                }
                actix_ws::Message::Text(msg) => {
                    let mut app_data = fapp.lock().unwrap();
                    let (channel, json_data) = msg.split_once(";:;;:;").unwrap();
                    beezle::print("got ur fucking data");
                    let mut handle = "".to_string();
                    // CHANNEL: connection
                    handle = channels::connection::socket(
                        WsData {
                            channel: channel.to_string(),
                            json_data: json_data.to_string(),
                        },
                        &mut session,
                    )
                    .await;

                    if handle != "" {
                        current_session_handle = handle;
                    }

                    // CHANNEL: notification
                    handle = channels::notification::socket(
                        WsData {
                            channel: channel.to_string(),
                            json_data: json_data.to_string(),
                        },
                        &mut session,
                        &mut app_data.connections,
                        &client,
                    )
                    .await;

                    if handle != "" {
                        current_session_handle = handle;
                    }

                    beezle::print(format!("Storing user {}", current_session_handle).as_str());
                    // store the user handle in session hashmap
                    app_data
                        .connections
                        .insert(current_session_handle.clone(), session.clone());
                }
                _ => break,
            }
        }
        let mut app_data = fapp.lock().unwrap();
        app_data.connections.remove(&current_session_handle);
        beezle::print(format!("Closing session: {}", current_session_handle).as_str());
        let _ = session.close(None).await;
        beezle::print("Closed session");
    });
    beezle::print("Closed GET");

    Ok(response)
}
