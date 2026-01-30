declare namespace BeezlePolls {
    interface PollVoter {
        poll_id: string;
        handle: string;
        value: string;
    }
    interface Poll {
        title: string;
        options: Array<string>;
        poll_id: string;
        post_id: string;
        voters: Array<PollVoter>;
        expiry_date: {
            $date: {
                $numberLong: string;
            };
        };
    }
}
