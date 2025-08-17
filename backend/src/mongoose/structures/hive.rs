use bson::{serde_helpers::chrono_datetime_as_bson_datetime, Array};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Hive {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub hive_id: String,
    pub handle: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub banner: String,
    pub owner: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub creation_date: chrono::DateTime<chrono::Utc>,
    pub moderators: Option<Array>,
    pub level: i64,
    pub coins: i64
}


#[derive(Serialize, Deserialize, Debug)]
pub struct HiveMember {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub part_of: String,
    pub handle: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub join_date: chrono::DateTime<chrono::Utc>,
}
