use bson::serde_helpers::chrono_datetime_as_bson_datetime;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

pub const MESSAGE_FETCH_OFFSET: i64 = 50;

#[derive(Serialize, Deserialize, Debug)]
pub struct DmMessage {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub author: String,
    pub content: String,
    pub channel: String,
    pub msg_id: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub timestamp: chrono::DateTime<chrono::Utc>,
}
