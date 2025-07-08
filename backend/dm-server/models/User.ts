import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    handle: String,
    username: String,
    email: String,
    hash_password: String,
    creation_date: { $date: { $numberLong: String } },
    verified: Boolean,
    avatar: String,
    banner: String,
    about_me: String,
    badges: Array,
    bookmarks: Array,
    followers: Array,
    following: Array,
    reputation: Number,
    coins: Number,
    notifs: Array,
    levels: {
        level: Number,
        xp: Number,
    },
    activity: String,
    customization: {
        name_color: {
            color1: String,
            color2: String,
        },
        profile_gradient: {
            color1: String,
            color2: String,
        },
        profile_gradient_bought: Boolean,
        name_color_bought: Boolean,
        square_avatar_bought: Boolean,
        square_avatar: Boolean,

        profile_postbox_img: String,
        profile_postbox_img_bought: Boolean,

        emojis: Array,
    },
    pinned_post: String,
    connections: {
        steam: {
            id: String,
        },
    },
});
const User = mongoose.model("Users", UserSchema);
export { User, UserSchema };

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
