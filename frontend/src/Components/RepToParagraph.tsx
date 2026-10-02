import { useEffect, useState } from "react";

function RepToParagraph({ reputation }: { reputation: number }) {
    const [icon_class, setIconClass] = useState("");
    const [color, setColor] = useState("");
    const [text, setIconText] = useState("");

    useEffect(() => {
        if (reputation < 25) {
            setIconClass("nf nf-fae-biohazard");
            setColor("red");
            setIconText("Awful Reputation");
        } else if (reputation < 50) {
            setIconClass("nf nf-fa-circle_radiation");
            setColor("orange");
            setIconText("Bad Reputation");
        } else if (reputation < 75) {
            setIconClass("nf nf-fa-circle_exclamation");
            setColor("yellow");
            setIconText("Decent Reputation");
        } else if (reputation >= 75) {
            setIconClass("nf nf-fa-check_circle");
            setColor("lime");
            setIconText("Good Reputation");
        } else {
            setIconClass("nf nf-fa-questionn");
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
