import { useEffect, useState } from "react";

function RepToIcon({ reputation }: { reputation: number }) {
    const [icon_class, setIconClass] = useState("");
    const [color, setColor] = useState("");

    useEffect(() => {
        if (reputation < 25) {
            setIconClass("nf nf-fae-biohazard");
            setColor("red");
        } else if (reputation < 50) {
            setIconClass("nf nf-fa-circle_radiation");
            setColor("orange");
        } else if (reputation < 75) {
            setIconClass("nf nf-fa-circle_exclamation");
            setColor("yellow");
        } else if (reputation >= 75) {
            setIconClass("nf nf-fa-check_circle");
            setColor("lime");
        } else {
            setIconClass("nf nf-fa-questionn");
            setColor("white");
        }
    }, []);

    return <i className={icon_class} style={{ color: color }}></i>;
}

export default RepToIcon;
