use bson::serde_helpers::chrono_datetime_as_bson_datetime;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Report {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub reporting: String,
    pub subject: String,
    pub context: String,
    pub reported_by: String,
    pub report_id: String,
}
