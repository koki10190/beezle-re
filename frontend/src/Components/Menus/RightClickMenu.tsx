import { useEffect, useRef, useState } from "react";
import "./RightClickMenu.css";
import { DisableScroll, EnableScroll } from "../../functions/ScrollEvents";

interface Props {
    children: React.ReactNode;
    name: string;
    icon?: React.ReactNode;
    mouse_pos: { x: number; y: number };
    onClickAnywhere?: (e: MouseEvent) => void;
    dontDisableScrolling?: boolean;
}

function RightClickMenu({ children, icon, name, mouse_pos, dontDisableScrolling = false, onClickAnywhere = () => {} }: Props) {
    const [clickedMousePos, setClickedMousePos] = useState<{ x: number; y: number }>({ x: -5000, y: -5000 });
    const divRef = useRef<HTMLDivElement>();

    useEffect(() => {
        if (!dontDisableScrolling) DisableScroll();
        const cb = (e: MouseEvent) => {
            onClickAnywhere(e);
            if (!dontDisableScrolling) EnableScroll();
        };

        const touchcb = (e: TouchEvent) => {
            var touch = e.touches[0] || e.changedTouches[0];
            mouse_pos.x = touch.pageX;
            mouse_pos.y = touch.pageY;
        };

        window.addEventListener("mousedown", cb);
        window.addEventListener("touchstart", touchcb);

        setClickedMousePos((old) => {
            if (!mouse_pos) return clickedMousePos;

            if (mouse_pos.y + divRef.current.offsetHeight > window.innerHeight) {
                mouse_pos.y = window.innerHeight - divRef.current.offsetHeight - 20;
            }

            if (mouse_pos.x + divRef.current.offsetWidth > window.innerWidth) {
                mouse_pos.x = window.innerWidth - divRef.current.offsetWidth - 20;
            }

            return mouse_pos;
        });

        return () => {
            window.removeEventListener("mousedown", cb);
            window.removeEventListener("touchstart", touchcb);
        };
    }, []);

    return (
        <div
            style={{
                top: clickedMousePos.y + 10,
                left: clickedMousePos.x + 5,
            }}
            ref={divRef}
            className="right-click-menu"
        >
            <p className="rcm-name">
                {icon} {name}
            </p>
            {children}
        </div>
    );
}

export default RightClickMenu;
