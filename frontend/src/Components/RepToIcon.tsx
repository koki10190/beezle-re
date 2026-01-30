import { useEffect, useState } from "react";

function RepToIcon({ reputation }: { reputation: number }) {
    const [icon_class, setIconClass] = useState("");
    const [color, setColor] = useState("");

    useEffect(() => {
        if (reputation < 25) {
            setIconClass("fa-solid fa-biohazard");
            setColor("red");
        } else if (reputation < 50) {
            setIconClass("fa-solid fa-circle-radiation");
            setColor("orange");
        } else if (reputation < 75) {
            setIconClass("fa-solid fa-circle-exclamation");
            setColor("yellow");
        } else if (reputation >= 75) {
            setIconClass("fa-solid fa-hexagon-check");
            setColor("lime");
        } else {
            setIconClass("fa-question");
            setColor("white");
        }
    }, []);

    return <i className={icon_class} style={{ color: color }}></i>;
}

export default RepToIcon;
