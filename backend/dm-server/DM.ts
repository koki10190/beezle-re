import { UserPublic } from "./UserType";

interface DMData {
    from: UserPublic;
    to: UserPublic;
    content: string;
    date: Date;
    edited: boolean;
}

export type { DMData };
