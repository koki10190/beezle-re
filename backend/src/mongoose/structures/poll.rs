use bson::{serde_helpers::chrono_datetime_as_bson_datetime, Array};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Debug)]
pub struct Poll {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub poll_id: String,
    pub title: String,
    pub options: Array,
    pub post_id: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub expiry_date: chrono::DateTime<chrono::Utc>,
    pub over: bool
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PollVoter {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub poll_id: String,
    pub handle: String,
    pub value: String
}

