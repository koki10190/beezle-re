use std::{collections::HashMap, sync::{Arc, Mutex}, time::{Duration, Instant}};

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
    ws_sessions: web::Data<Arc<Mutex<HashMap<String, actix_ws::Session>>>>
) -> actix_web::Result<impl Responder> {
    let (res, mut session, mut stream) = actix_ws::handle(&req, body)?;

    actix_web::rt::spawn(async move {
        let mut user_handle = String::new();
        while let Some(message) = stream.next().await {
            match message {
                Ok(Message::Binary(_)) => {}
                Ok(Message::Ping(_)) => {}
                Ok(Message::Continuation(_)) => {}
                Ok(Message::Pong(_)) => {}
                Ok(Message::Close(_)) => {}
                Ok(Message::Nop) => {}
                Ok(Message::Text(msg)) => {
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
                        /*
                        DATA REQUIRED:
                        handle: string;
                        */
                        "connect" => {
                            if let Some(data) = data {
                                user_handle = data.get("handle").expect("Handle not found").as_str().unwrap().to_string();
                                let clone = Arc::clone(ws_sessions.get_ref());
                                let locked = clone.lock();

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
                                let clone = Arc::clone(ws_sessions.get_ref());
                                let locked = clone.lock();
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
                }
                Err(err) => {}
            }
        }

        if !user_handle.is_empty() {
            let clone = Arc::clone(ws_sessions.get_ref());
            let locked = clone.lock();

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
    });

    Ok(res)
}