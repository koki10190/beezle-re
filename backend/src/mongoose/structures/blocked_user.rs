use bson::{serde_helpers::chrono_datetime_as_bson_datetime, Array, Bson};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Debug)]
pub struct BlockedUser {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub who: String,
    pub by: String
}
