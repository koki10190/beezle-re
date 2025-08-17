interface HiveEditData {
    icon: string;
    banner: string;
    description: string;
    name: string;
    handle: string;
}

declare namespace BeezleHives {
    interface Hive {
        icon: string;
        banner: string;
        description: string;
        name: string;
        handle: string;
        owner: string;
        hive_id: string;
        moderators: Array<string> | null;
        creation_date: {
            $date: {
                $numberLong: string;
            };
        };
        levels: {
            xp: number;
            level: number;
        };
        coins: number;
    }
}
