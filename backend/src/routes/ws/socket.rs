use std::{collections::HashMap, sync::Mutex, time::{Duration, Instant}};

use actix_web::{middleware::Logger, web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_ws::{Message, MessageStream, Session};
use bson::doc;
use futures::StreamExt;
use genius_rust::user;
use tokio::{task::spawn_local, time::{self, interval}};

use crate::{beezle, routes::ws::structs::MessageData};

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub async fn main_ws(
    req: HttpRequest,
    body: web::Payload, 
    ws_sessions: web::Data<Mutex<HashMap<String, actix_ws::Session>>>
) -> actix_web::Result<impl Responder> {
    let (res, session, msg_stream) = actix_ws::handle(&req, body)?;

    // spawn websocket handler (and don't await it) so that the response is returned immediately
    spawn_local(ws(
        session,
        msg_stream,
        ws_sessions
    ));

    Ok(res)
}


async fn ws(mut session: Session, mut msg_stream: MessageStream, ws_sessions: web::Data<Mutex<HashMap<String, actix_ws::Session>>>) {

    let mut user_handle = String::new();

    let mut last_heartbeat = Instant::now();
    let mut interval = time::interval(HEARTBEAT_INTERVAL);
    beezle::print("uh");

    let _close_reason = loop {
        tokio::select! {
            Some(Ok(msg)) = msg_stream.next() => {
                match msg {
                    Message::Ping(bytes) => {
                        if session.pong(&bytes).await.is_err() {
                            break;
                        }
                    }
                    Message::Text(msg) => {
                        let json_data: Result<MessageData,  serde_json::Error> = serde_json::from_str(&msg.to_string());
                        println!("[WS] Got Message: {}", msg);

                        if let Err(data) = json_data {
                            beezle::print(format!("WS Error: {:?}", data).as_str());
                            break;
                        }

                        let data = json_data.unwrap();
                        let channel = data.channel.as_str();
                        let data = data.data.as_document();

                        match channel {
                            "ping" => {
                                last_heartbeat = Instant::now();
                                let _ = session.text("{\"channel\": \"pong\", \"data\": {}}").await;
                            }
                            "pong" => {
                                last_heartbeat = Instant::now();
                            }
                            /*
                            DATA REQUIRED:
                            handle: string;
                            */
                            "connect" => {
                                if let Some(data) = data {
                                    user_handle = data.get("handle").expect("Handle not found").as_str().unwrap().to_string();
                                    let locked = ws_sessions.lock();
                                    
                                    match locked {
                                        Ok(mut sessions) => {
                                            sessions.insert(user_handle.clone(), session.clone());
                                            beezle::print("Inserted user to sessions.");
                                        }
                                        Err(err) => {
                                            beezle::print(format!("Error in mutex: {:?}", err).as_str());
                                        }
                                    }
                                }
                            }


                            /*
                            DATA REQUIRED:
                            talking_to: string;
                            message: string;
                            */
                            "talk_other" => {
                                if let Some(data) = data {
                                    let others_handle = data.get("talking_to").expect("talking_to not found").as_str().unwrap().to_string();
                                    let locked = ws_sessions.lock();
                                    println!("Got message for channel talk_other {}", others_handle);
                                    
                                    match locked {
                                        Ok(mut sessions) => {
                                            for (handle, session) in sessions.iter() {
                                                println!("Handle: '{}'", handle);
                                            }
                                            let mut other = sessions.get_mut(&others_handle);
                                            println!("Getting user...");
                                            if let Some(user) = other {
                                                println!("User is valid! sending...");
                                                let message = data.get("message").expect("message not found").to_string();
                                                let send_data = doc! {
                                                    "channel": "from_other",
                                                    "data": {
                                                        "message": message
                                                    }
                                                };

                                                user.text(send_data.to_string()).await.expect("Sending Failed.");
                                            } else {
                                                println!("User aint valid.");
                                            }

                                        }
                                        Err(err) => {
                                            beezle::print(format!("Error in mutex: {:?}", err).as_str());
                                        }
                                    }
                                }
                            }
                            _ => {
                                beezle::print("Channel not found");
                            }
                        }

                    },
                    _ => break,
                }
            }
        
            _ = interval.tick() => {
                if Instant::now().duration_since(last_heartbeat) > CLIENT_TIMEOUT {
                    break;
                }
                let send_data = doc! {
                    "channel": "ping",
                    "data": {}
                };
                let _ = session.text(serde_json::to_string(&send_data).unwrap()).await;
            }

            else => {
                break;
            }
        }
    };

    if !user_handle.is_empty() {
        let locked = ws_sessions.lock();

        match locked {
            Ok(mut sessions) =>  {
                beezle::print("Session disconnected, removed user from session.");
                sessions.remove(&user_handle);
            }
            Err(err) => {
                beezle::print(format!("Error in mutex: {:?}", err).as_str());
            }
        }
    }
    let _ = session.close(None).await;
    beezle::print("Session closed");

    // actix_web::rt::spawn(async move {
    //     while let Some(Ok(msg)) = msg_stream.next().await {
            
    //     }

    //     if !user_handle.is_empty() {
    //         let locked = ws_sessions.lock();

    //         match locked {
    //             Ok(mut sessions) =>  {
    //                 beezle::print("Session disconnected, removed user from session.");
    //                 sessions.remove(&user_handle);
    //             }
    //             Err(err) => {
    //                 beezle::print(format!("Error in mutex: {:?}", err).as_str());
    //             }
    //         }
    //     }
    //     let _ = session.close(None).await;
    // });

    // Ok(response)
}