import { CustomEmoji } from "emoji-picker-react/dist/config/customEmojiConfig";
import { NotificationData } from "./Notification";

enum BadgeType {
    VERIFIED,
    DONATOR,
    MODERATOR,
    OWNER,
    OLD_TESTER,
    CONTRIBUTOR,
}

interface UserCustomization {
    name_color: {
        color1: string;
        color2: string;
    };
    profile_gradient: {
        color1: string;
        color2: string;
    };
    profile_gradient_bought: boolean;
    name_color_bought: boolean;
    square_avatar_bought: boolean;
    square_avatar: boolean;

    profile_postbox_img: string;
    profile_postbox_img_bought: boolean;

    emojis: Array<CustomEmoji>;
}

interface UserConnections {
    steam: {
        id: string;
    };
    spotify: {
        access_token: string;
        refresh_token: string;
        display_name: string;
        id: string;
        external_urls: {
            spotify: string;
        };
        images: Array<{ width: number; height: number; url: string }>;
    };
    lastfm: {
        username: string;
        show_scrobbling?: boolean;
    };
    discord: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        data: {
            username: string;
            display_name: string;
            discord_id: string;
            avatar: string;
        };
    };
}

interface UserPublic {
    handle: string;
    username: string;
    verified: boolean;
    avatar: string;
    banner: string;
    about_me: string;
    creation_date: {
        $date: {
            $numberLong: string;
        };
    };
    badges: Array<BadgeType>;
    followers: Array<string>;
    following: Array<string>;
    reputation: number;
    coins: number;
    notifications: Array<NotificationData>;
    levels: {
        level: number;
        xp: number;
    };
    activity: string;
    customization: UserCustomization;
    pinned_post: string;
    connections: UserConnections;
}

interface UserPrivate extends UserPublic {
    email: string;
    hash_password: string;
    bookmarks: Array<string>;
}

export { BadgeType };
export type { UserPrivate, UserPublic, UserCustomization };
