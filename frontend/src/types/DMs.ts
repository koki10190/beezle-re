declare namespace BeezleDM {
    interface Message {
        content: string;
        author: string;
        timestamp: number;
        replying_to?: string;
        edited?: boolean;
        msg_id: string;
    }

    interface DmOption {
        selection_id: string;
        is_group: boolean;
        group_id?: string;
        user_handle?: string;
    }
}
