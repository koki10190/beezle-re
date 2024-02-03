interface Post {
    handle: string;
    post_op_handle: string;
    content: string;
    repost: boolean;
    post_id: string;
    creation_date: {
        $date: {
            $numberLong: string;
        };
    };
}

export type { Post };
