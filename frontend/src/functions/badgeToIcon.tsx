import { BadgeType } from "../types/User";
import React from "react";

function BadgeToIcon({ badge, is_bot = false, className = "" }: { badge: BadgeType; is_bot?: boolean; className: string }) {
    // console.log(is_bot);
    if (is_bot) {
        // console.log("IS BOT");
        return <i title="Bot ACcount" style={{ color: "rgb(255, 228, 76)" }} className={`${className} nf nf-md-robot`}></i>;
    }
    switch (badge) {
        case BadgeType.VERIFIED: {
            return <i title="Verified" style={{ color: "rgb(255, 142, 76)" }} className={`${className} nf nf-md-check_decagram`}></i>;
        }
        case BadgeType.DONATOR: {
            return <i title="Donator (Thank You! ❤️)" style={{ color: "rgb(255, 237, 43)" }} className={`${className} nf nf-md-bee`}></i>;
        }
        case BadgeType.MODERATOR: {
            return <i title="Moderator" style={{ color: "rgb(255, 166, 114)" }} className={`${className} nf nf-md-shield_check`}></i>;
        }
        case BadgeType.OWNER: {
            return <i title="Owner" style={{ color: "rgb(74, 255, 128)" }} className={`${className} nf nf-md-code_braces_box`}></i>; // fa-solid fa-gear-complex-code
        }
        case BadgeType.OLD_TESTER: {
            return <i title="Old Tester" style={{ color: "rgb(154, 46, 255)" }} className={`${className} nf nf-fa-vial`}></i>;
        }
        case BadgeType.CONTRIBUTOR: {
            return <i title="Contributor" style={{ color: "rgb(231, 48, 255)" }} className={`${className} nf nf-fa-handshake_angle`}></i>;
        }
    }
}

export default BadgeToIcon;
