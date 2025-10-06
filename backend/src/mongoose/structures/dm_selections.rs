use bson::serde_helpers::chrono_datetime_as_bson_datetime;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

pub const MESSAGE_FETCH_OFFSET: i64 = 50;

#[derive(Serialize, Deserialize, Debug)]
pub struct DmSelection {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub is_group: bool,
    pub group_id: Option<String>,
    pub user_handle: Option<String>,
    pub belongs_to: String,
    pub selection_id: String
}
