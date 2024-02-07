import { NotificationData } from "./Notification";

enum BadgeType {
    VERIFIED,
    DONATOR,
    MODERATOR,
    OWNER,
}

interface UserPrivate {
    handle: string;
    username: string;
    email: string;
    hash_password: string;
    verified: boolean;
    avatar: string;
    banner: string;
    about_me: string;
    bookmarks: Array<string>;
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
}

export { BadgeType };
export type { UserPrivate, UserPublic };
