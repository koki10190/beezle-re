use actix_web::web;
use actix_web::HttpResponse;
use futures::StreamExt;

use crate::ws::channels;

use super::structures::ws_data::WsData;

pub async fn spawn(
    req: actix_web::HttpRequest,
    body: web::Payload,
) -> Result<HttpResponse, actix_web::Error> {
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, body)?;

    actix_rt::spawn(async move {
        while let Some(Ok(msg)) = msg_stream.next().await {
            match msg {
                actix_ws::Message::Ping(bytes) => {
                    if session.pong(&bytes).await.is_err() {
                        return;
                    }
                }
                actix_ws::Message::Text(msg) => {
                    let (channel, json_data) = msg.split_once(";:;;:;").unwrap();

                    channels::connection::socket(
                        WsData {
                            channel: channel.to_string(),
                            json_data: json_data.to_string(),
                        },
                        &mut session,
                    )
                    .await;
                }
                _ => break,
            }
        }

        let _ = session.close(None).await;
    });

    Ok(response)
}
