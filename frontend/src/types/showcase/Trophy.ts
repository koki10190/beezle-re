interface TrophyType {
    name: string;
    requirement: "likes" | "follows" | "reposts";
    requirement_need: number;
    icon: string;
    color: string;
    description: string;
}

const TROPHIES: Array<TrophyType> = [
    // LIKES
    {
        name: "10 Likes",
        requirement: "likes",
        requirement_need: 10,
        icon: "fa-solid fa-square-heart",
        color: "white",
        description: "Get 10 likes on one of your posts!",
    },
    {
        name: "100 Likes",
        requirement: "likes",
        requirement_need: 10,
        icon: "fa-solid fa-square-heart",
        color: "rgb(255, 174, 0)",
        description: "Get 100 likes on one of your posts!",
    },
    {
        name: "1k Likes",
        requirement: "likes",
        requirement_need: 1000,
        icon: "fa-solid fa-star",
        color: "rgb(255, 55, 55)",
        description: "Get 1,000 likes on one of your posts!",
    },
    {
        name: "10k Likes",
        requirement: "likes",
        requirement_need: 1000,
        icon: "fa-solid fa-star",
        color: "rgb(70, 119, 255)",
        description: "Get 10,000 likes on one of your posts!",
    },

    // FOLLOWS
    {
        name: "10 Followers",
        requirement: "follows",
        requirement_need: 10,
        icon: "fa-solid fa-award",
        color: "white",
        description: "Get 10 people to follow your account!",
    },
    {
        name: "100 Followers",
        requirement: "follows",
        requirement_need: 100,
        icon: "fa-solid fa-award-simple",
        color: "rgb(255, 174, 0)",
        description: "Get 100 people to follow your account!",
    },
    {
        name: "1k Followers",
        requirement: "follows",
        requirement_need: 1000,
        icon: "fa-solid fa-medal",
        color: "rgb(255, 55, 55)",
        description: "Get 1,000 people to follow your account!",
    },
    {
        name: "10k Followers",
        requirement: "follows",
        requirement_need: 1000,
        icon: "fa-solid fa-crown",
        color: "rgb(70, 119, 255)",
        description: "Get 10,000 people to follow your account!",
    },

    // REPOSTS
    {
        name: "10 Reposts",
        requirement: "reposts",
        requirement_need: 10,
        icon: "fa-solid fa-repeat",
        color: "white",
        description: "Get 10 reposts on one of your posts!",
    },
    {
        name: "100 Reposts",
        requirement: "reposts",
        requirement_need: 10,
        icon: "fa-solid fa-medal",
        color: "rgb(255, 174, 0)",
        description: "Get 10 reposts on one of your posts!",
    },
    {
        name: "1k Reposts",
        requirement: "reposts",
        requirement_need: 1000,
        icon: "fa-solid fa-trophy",
        color: "rgb(255, 55, 55)",
        description: "Get 1,10 reposts on one of your posts!",
    },
    {
        name: "10k Reposts",
        requirement: "reposts",
        requirement_need: 1000,
        icon: "fa-solid fa-trophy-star",
        color: "rgb(70, 119, 255)",
        description: "Get 10,10 reposts on one of your posts!",
    },
];

enum Trophy {
    // Likes
    Likes10,
    Likes100,
    Likes1000,
    Likes10000,

    // Follows
    Follows10,
    Follows100,
    Follows1000,
    Follows10000,

    // Reposts
    Reposts10,
    Reposts100,
    Reposts1000,
    Reposts10000,
}

export { TROPHIES, Trophy };
export type { TrophyType };
