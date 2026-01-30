import { UserPublic } from "./User";

enum NotifType {
    None,
    Post,
    Handle,
    Milestone,
}

interface NotificationData {
    caller: string;
    post_id: string;
    notif_type: NotifType;
    message: string;
    user: UserPublic | null;
    react_key_prop_id: string | null;
    milestone?: number;
}

export { NotifType };
export type { NotificationData };
