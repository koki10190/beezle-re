interface TrophyType {
    name: string;
    requirement: "likes" | "follows";
    requirement_need: number;
    icon: string;
    description: string;
}

const TROPHIES: Array<TrophyType> = [
    {
        name: "10 Likes",
        requirement: "likes",
        requirement_need: 10,
        icon: "fa-solid fa-square-heart",
        description: "Get 10 likes on one of your posts!",
    },
    {
        name: "100 Likes",
        requirement: "likes",
        requirement_need: 10,
        icon: "fa-solid fa-square-heart",
        description: "Get 10 likes on one of your posts!",
    },
    {
        name: "1k Likes",
        requirement: "likes",
        requirement_need: 1000,
        icon: "fa-solid fa-star",
        description: "Get 1,000 likes on one of your posts!",
    },
    {
        name: "10k Likes",
        requirement: "likes",
        requirement_need: 1000,
        icon: "fa-solid fa-star",
        description: "Get 10,000 likes on one of your posts!",
    },
];

export { TROPHIES };
export type { TrophyType };
