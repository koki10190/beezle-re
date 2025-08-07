import { redirect } from "react-router-dom";
import { fetchUserPrivate, GetUserPrivate } from "./fetchUserPrivate";
import { BadgeType, UserPublic } from "../types/User";
import BadgeToIcon from "./badgeToIcon";
import "./badgesToJSX.css";

function BadgesToJSX({
    badges,
    user = null,
    is_bot = false,
    className = "",
}: {
    badges: Array<BadgeType>;
    is_bot?: boolean;
    user?: UserPublic;
    className: string;
}) {
    return (
        <>
            {is_bot ? <BadgeToIcon is_bot={is_bot} badge={BadgeType.VERIFIED} className={className} /> : ""}
            {user?.hive_tag ? (
                <div className="hive-tag">
                    <p className="tag-text">{user.hive_tag}</p>
                </div>
            ) : (
                ""
            )}
            {badges.map((badge: BadgeType) => {
                return <BadgeToIcon key={badge} badge={badge} className={className} />;
            })}
        </>
    );
}

export { BadgesToJSX };
