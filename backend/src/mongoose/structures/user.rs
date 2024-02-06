use bson::{serde_helpers::chrono_datetime_as_bson_datetime, Array};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

pub enum UserStatus {
    ONLINE,
    IDLE,
    DND,
    INVISIBLE,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub handle: String,
    pub username: String,
    pub email: String,
    pub hash_password: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub creation_date: chrono::DateTime<chrono::Utc>,
    pub verified: bool,
    pub avatar: String,
    pub banner: String,
    pub about_me: String,
    pub badges: Array,
    pub bookmarks: Array,
    pub followers: Array,
    pub following: Array,
    pub reputation: i64,
    pub coins: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct JwtUser {
    pub handle: String,
    pub username: String,
    pub email: String,
    pub hash_password: String,
    pub exp: usize,
    pub badges: Array,
}
