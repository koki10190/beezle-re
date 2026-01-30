import { useEffect, useState } from "react";

function RepToParagraph({ reputation }: { reputation: number }) {
    const [icon_class, setIconClass] = useState("");
    const [color, setColor] = useState("");
    const [text, setIconText] = useState("");

    useEffect(() => {
        if (reputation < 25) {
            setIconClass("fa-solid fa-biohazard");
            setColor("red");
            setIconText("Awful Reputation");
        } else if (reputation < 50) {
            setIconClass("fa-solid fa-circle-radiation");
            setColor("orange");
            setIconText("Bad Reputation");
        } else if (reputation < 75) {
            setIconClass("fa-solid fa-circle-exclamation");
            setColor("yellow");
            setIconText("Decent Reputation");
        } else if (reputation >= 75) {
            setIconClass("fa-solid fa-hexagon-check");
            setColor("lime");
            setIconText("Good Reputation");
        } else {
            setIconClass("fa-question");
            setColor("white");
            setIconText("No Reputation");
        }
    }, []);

    return (
        <p>
            <i className={icon_class} style={{ color: color }}></i> {text}
        </p>
    );
}

export default RepToParagraph;
