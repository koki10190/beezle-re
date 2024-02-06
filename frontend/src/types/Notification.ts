import { UserPublic } from "./User";

interface NotificationData {
    caller: string;
    post_id: string;
    message: string;
    user: UserPublic | null;
    react_key_prop_id: string | null;
}

export type { NotificationData };
