import parseURLs from "../functions/parseURLs";
import { AVATAR_SHAPES, AvatarShape } from "../types/cosmetics/AvatarShapes";
import { UserPublic } from "../types/User";
import RepToIcon from "./RepToIcon";
import "./MentionHover.css";
import { useNavigate } from "react-router-dom";

function MentionHover({ user, mousePos }: { user: UserPublic; mousePos: { x: number; y: number } }) {
    const navigate = useNavigate();
    return (
        <div
            style={{
                top: mousePos.y + 5,
                left: mousePos.x + 5,
                backgroundImage: `linear-gradient(-45deg, ${
                    user.customization?.profile_gradient ? user.customization.profile_gradient.color1 : "rgb(231, 129, 98)"
                }, ${user.customization?.profile_gradient ? user.customization.profile_gradient.color2 : "rgb(231, 129, 98)"})`,
            }}
            className="mention-hover"
        >
            <div
                style={{
                    backgroundImage: `url(${user ? user.avatar : ""})`,
                    clipPath: AVATAR_SHAPES[user?.customization?.square_avatar]
                        ? AVATAR_SHAPES[user?.customization?.square_avatar].style
                        : AVATAR_SHAPES[AvatarShape.CircleAvatarShape].style,
                    borderRadius:
                        AVATAR_SHAPES[user?.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                            ? user?.customization?.square_avatar
                                ? "5px"
                                : "100%"
                            : "100%",
                }}
                className="mention-pfp"
            ></div>
            <div className="mention-hover-user-details">
                <p className="mention-username">{user?.username ?? "Username"}</p>
                <p className="mention-handle">
                    @{user?.handle ?? "handle"} <RepToIcon reputation={user?.reputation ?? 100} />{" "}
                    {true ? <span style={{ color: "white" }}> {user?.activity ? `- ${user.activity}` : ""}</span> : ""}
                </p>
            </div>
            <div className="about-me">
                <p
                    style={{
                        fontSize: "13px",
                        color: "#ffffffa0",
                        marginBottom: "-10px",
                    }}
                >
                    About Me
                </p>
                <p
                    dangerouslySetInnerHTML={{
                        __html: parseURLs(user?.about_me ?? "Hello! I'm new here.", user, false, "", navigate),
                    }}
                ></p>
            </div>
        </div>
    );
}
export default MentionHover;
