function ShadeColor(color: string, amount: number, black: boolean = false) {
    if (color.replace("#", "") === "000000") return "#000000";
    return (
        "#" +
        color.replace(/^#/, "").replace(/../g, (color) => ("0" + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2))
    );
}

export default ShadeColor;
