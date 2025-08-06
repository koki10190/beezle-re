import { redirect } from "react-router-dom";
import { fetchUserPrivate, GetUserPrivate } from "./fetchUserPrivate";
import { BadgeType } from "../types/User";
import BadgeToIcon from "./badgeToIcon";

function BadgesToJSX({ badges, is_bot = false, className = "" }: { badges: Array<BadgeType>; is_bot?: boolean; className: string }) {
    return (
        <>
            {is_bot ? <BadgeToIcon is_bot={is_bot} badge={BadgeType.VERIFIED} className={className} /> : ""}
            {badges.map((badge: BadgeType) => {
                return <BadgeToIcon key={badge} badge={badge} className={className} />;
            })}
        </>
    );
}

export { BadgesToJSX };
