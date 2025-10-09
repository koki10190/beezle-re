declare namespace BeezleDM {
    interface Message {
        content: string;
        author: string;
        timestamp: number;
        replying_to?: string;
        edited?: boolean;
        channel?: string;
        msg_id: string;
    }

    interface GroupChat {
        owner: boolean;
        name: string;
        group_id: string;
        members: Array<string>;
        avatar: string;
        creation_date: {
            $date: {
                $numberLong: string;
            };
        };
    }

    interface DmOption {
        selection_id: string;
        is_group: boolean;
        group_id?: string;
        user_handle?: string;
    }
}
