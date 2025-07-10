import { useEffect, useState } from "react";
import { UserCustomization, UserPublic } from "../types/User";

function Username({ user }: { user: UserPublic }) {
    const [style, setStyle] = useState<any>();

    useEffect(() => {
        if (user.customization?.name_color) {
            setStyle((old) => {
                let New = { ...old };
                New.background = `linear-gradient(45deg, ${user.customization.name_color.color1}, ${user.customization.name_color.color2})`;
                New.backgroundClip = "text";
                New.WebkitTextFillColor = "transparent";

                // New.color = `rgb(${user.customization.name_color.r}, ${user.customization.name_color.g}, ${user.customization.name_color.b})`;
                return New;
            });
        }
    }, []);

    return (
        <span className="webkit-clip" style={style}>
            {user.username}
        </span>
    );
}

export default Username;
