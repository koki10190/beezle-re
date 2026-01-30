use bson::{serde_helpers::chrono_datetime_as_bson_datetime, Array};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

pub const MESSAGE_FETCH_OFFSET: i64 = 50;

#[derive(Serialize, Deserialize, Debug)]
pub struct DmSelection {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub owner: String,
    pub group_id: String,
    pub members: Array,
    pub name: String,
    pub avatar: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub creation_date: chrono::DateTime<chrono::Utc>,
}
