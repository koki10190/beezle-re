import { PostReaction } from "./ReactionsData";

interface Post {
    error?: any;
    handle: string;
    post_op_handle: string;
    content: string;
    repost: boolean;
    post_id: string;
    likes: Array<string>;
    reposts: Array<string>;
    post_op_id: string;
    edited: boolean;
    replying_to: string;
    is_reply: boolean;
    post_reactions: Array<PostReaction>;
    reply_count: number;
    creation_date: {
        $date: {
            $numberLong: string;
        };
    };
}

export type { Post };
