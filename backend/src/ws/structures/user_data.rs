use serde::Deserialize;

// use crate::mongoose::structures::user::UserStatus;

#[derive(Deserialize)]
pub struct WsUserData {
    pub handle: String,
    // UserStatus
    pub status: i64,
}
