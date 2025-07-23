const AVATAR_SHAPES: Array<{ name: string; price: number; style: string; level_required: number }> = [
    {
        name: "Circle Avatar Shape",
        price: 0,
        level_required: 0,
        style: "",
    },
    {
        name: "Hexagon Avatar Shape",
        price: 5000,
        level_required: 7,
        style: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)",
    },
    {
        name: "Square Avatar Shape",
        price: 1000,
        level_required: 5,
        style: "polygon(0 0, 100% 0%, 100% 100%, 0% 100%)",
    },
    {
        name: "Parallelogram Right Avatar Shape",
        price: 4500,
        level_required: 10,
        style: "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
    },
    {
        name: "Parallelogram Left Avatar Shape",
        price: 4500,
        level_required: 10,
        style: "polygon(0 1%, 75% 0, 100% 100%, 25% 100%)",
    },
    {
        name: "Triangle Avatar Shape",
        price: 1500,
        level_required: 5,
        style: "polygon(50% 0%, 0% 100%, 100% 100%)",
    },
    {
        name: "Rhombus Avatar Shape",
        price: 2000,
        level_required: 10,
        style: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    },
    {
        name: "Pentagon Avatar Shape",
        price: 5000,
        level_required: 15,
        style: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
    },
    {
        name: "Rabbet Avatar Shape",
        price: 5000,
        level_required: 20,
        style: "polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)",
    },
    {
        name: "Octagon Avatar Shape",
        price: 5000,
        level_required: 20,
        style: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
    },
    {
        name: "X Avatar Shape",
        price: 15000,
        level_required: 20,
        style: "polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%)",
    },
    {
        name: "Right Chevron Avatar Shape",
        price: 10000,
        level_required: 15,
        style: "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)",
    },
    {
        name: "Left Chevron Avatar Shape",
        price: 10000,
        level_required: 15,
        style: "polygon(100% 0%, 75% 50%, 100% 100%, 25% 100%, 0% 50%, 25% 0%)",
    },
    {
        name: "Star Avatar Shape",
        price: 15000,
        level_required: 30,
        style: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    },
];

enum AvaterShape {
    CircleAvatarShape,
    HexagonAvatarShape,
    SquareAvatarShape,
    ParallelogramRightAvatarShape,
    ParallelogramLeftAvatarShape,
    TriangleAvatarShape,
    RhombusAvatarShape,
    PentagonAvatarShape,
    RabbetAvatarShape,
    OctagonAvatarShape,
    XAvatarShape,
    RightChevronAvatarShape,
    LeftChevronAvatarShape,
    StarAvatarShape,
}

export { AvaterShape, AVATAR_SHAPES };
