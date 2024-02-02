import { BadgeType } from "../types/User";
import React from "react";

function BadgeToIcon({ badge, className = "" }: { badge: BadgeType; className: string }) {
    switch (badge) {
        case BadgeType.VERIFIED: {
            return <i style={{ color: "rgb(255, 142, 76)" }} className={`${className} fa-solid fa-badge-check`}></i>;
        }
        case BadgeType.DONATOR: {
            return <i style={{ color: "rgb(255, 237, 43)" }} className={`${className} fa-solid fa-honey-pot`}></i>;
        }
        case BadgeType.MODERATOR: {
            return <i style={{ color: "rgb(255, 166, 114)" }} className={`${className} fa-solid fa-shield-check`}></i>;
        }
    }
}

export default BadgeToIcon;
