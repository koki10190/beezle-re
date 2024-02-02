import { redirect } from "react-router-dom";
import { fetchUserPrivate } from "./fetchUserPrivate";
import { BadgeType } from "../types/User";
import BadgeToIcon from "./badgeToIcon";

function BadgesToJSX({ badges, className = "" }: { badges: Array<BadgeType>; className: string }) {
    return (
        <>
            {badges.map((badge: BadgeType) => {
                return <BadgeToIcon badge={badge} className={className} />;
            })}
        </>
    );
}

export { BadgesToJSX };
