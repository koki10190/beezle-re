use bson::serde_helpers::chrono_datetime_as_bson_datetime;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Hashtag {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub hashtag: String,
    pub from_user: String,
    pub post_id: String
}
