use serde::Deserialize;

use crate::mongoose::structures::post::Post;

// use crate::mongoose::structures::user::UserStatus;

#[derive(Deserialize)]
pub struct WsNotificationData {
    pub handle: String,
    // UserStatus
    pub post: Post,
    pub message: String,
}
