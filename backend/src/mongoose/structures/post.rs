use bson::{serde_helpers::chrono_datetime_as_bson_datetime, Array, Bson};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

pub const POST_OFFSET: i64 = 10;

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
    pub edited: bool,
    pub is_reply: bool,
    pub replying_to: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub creation_date: chrono::DateTime<chrono::Utc>,
    pub reactions: Bson,
    pub hive_post: Option<String>
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
    pub edited: bool,
    pub post_id: String,
    pub is_reply: bool,
    pub replying_to: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub creation_date: chrono::DateTime<chrono::Utc>,
}
