use bson::{serde_helpers::chrono_datetime_as_bson_datetime, Array};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Post {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub handle: String,
    pub content: String,
    pub repost: bool,
    pub likes: Array,
    pub reposts: Array,
    pub post_id: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub creation_date: chrono::DateTime<chrono::Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Repost {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub handle: String,
    pub post_op_handle: String,
    pub post_op_id: String,
    pub content: String,
    pub repost: bool,
    pub likes: Array,
    pub reposts: Array,
    pub post_id: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub creation_date: chrono::DateTime<chrono::Utc>,
}
