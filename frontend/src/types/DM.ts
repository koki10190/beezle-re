import { UserPublic } from "./User";

interface DMData {
    _id: string;
    from: UserPublic;
    to: UserPublic;
    content: string;
    date: Date;
    edited: boolean;
}

export type { DMData };
