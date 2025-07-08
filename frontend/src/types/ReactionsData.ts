import { UserPublic } from './User';

interface PostReaction {
    _id: string;
    post_id: string;
    handle: string;
    emoji: string;
}

interface ReactionsData {
    reacts: PostReaction[];
    count: number;
}

export type { ReactionsData, PostReaction };
