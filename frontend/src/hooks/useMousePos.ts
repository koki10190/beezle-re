import { useEffect, useState } from "react";

function mousePos() {
    const [pos, setPos] = useState({ x: null, y: null });
    useEffect(() => {
        const updateMousePosition = (e) => {
            setPos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", updateMousePosition);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
        };
    }, []);

    return pos;
}
export default mousePos;
