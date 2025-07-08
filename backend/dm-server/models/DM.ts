import mongoose, { Schema } from "mongoose";
import { UserSchema } from "./User";
import { UserPublic } from "../UserType";
const schema = new Schema({
    from: UserSchema,
    to: UserSchema,
    content: String,
    date: Date,
    edited: Boolean,
});
export default mongoose.model("DMs", schema);

// #[derive(Serialize, Deserialize, Debug)]
// pub struct UserLevels {
//     pub level: i64,
//     pub xp: i64,
// }

// #[derive(Serialize, Deserialize, Debug)]
// pub struct User {
//     #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
//     pub id: Option<ObjectId>,
//     pub handle: String,
//     pub username: String,
//     pub email: String,
//     pub hash_password: String,
//     #[serde(with = "chrono_datetime_as_bson_datetime")]
//     pub creation_date: chrono::DateTime<chrono::Utc>,
//     pub verified: bool,
//     pub avatar: String,
//     pub banner: String,
//     pub about_me: String,
//     pub badges: Array,
//     pub bookmarks: Array,
//     pub followers: Array,
//     pub following: Array,
//     pub reputation: i64,
//     pub coins: i64,
//     pub notifs: Array,
//     pub levels: UserLevels,
//     pub activity: String,
//     pub customization: Bson,
//     pub pinned_post: String,
//     pub connections: Bson,
// }
