declare namespace BeezleDM {
    interface Message {
        content: string;
        author: string;
        timestamp: Date;
        msg_id: string;
    }

    interface DmOption {
        selection_id: string;
        is_group: boolean;
        group_id?: string;
        user_handle?: string;
    }
}
