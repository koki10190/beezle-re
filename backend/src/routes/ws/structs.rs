use bson::Bson;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct MessageData {
    pub channel: String,
    pub data: Bson
}