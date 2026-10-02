import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useNavigate } from "react-router-dom";
import { api_uri } from "../../links";
import React from "react";
import { checkToken } from "../../functions/checkToken";
import { BadgeType, UserPrivate } from "../../types/User";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { NotificationData } from "../../types/Notification";

import { socket } from "../../ws/socket";
import { AVATAR_SHAPES } from "../../types/cosmetics/AvatarShapes";

function SettingsButton({
    redirect,
    iconClass,
    text,
    style,
    options,
    force_redirect = false,
}: {
    redirect: string;
    iconClass: string;
    text: string;
    style: any | undefined;
    options?: any | undefined;
    force_redirect?: boolean;
}) {
    const navigate = useNavigate();
    return (
        <a
            style={style ? style : {}}
            onClick={() => {
                if (force_redirect) {
                    window.location.href = redirect;
                } else {
                    navigate(redirect, options);
                }
            }}
            className="settings-button"
        >
            <i className={iconClass}></i> <span>{text}</span>
        </a>
    );
}

function RightSide({ forceExpansion, disableIcon }: { forceExpansion?: boolean; disableIcon?: boolean }) {
    const navigate = useNavigate();
    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);
    const [isExpanded, setExpanded] = useState(false);
    const [window_width, setWindowWidth] = useState(window.innerWidth);
    const [notifCount, setNotifCount] = useState(0);
    const [notifColor, setNotifColor] = useState("#ffffff");

    const ExpandRightSide = () => {
        const middle = document.querySelector(".side-middle") as HTMLDivElement;
        const right = document.querySelector(".side-right") as HTMLDivElement;

        // middle.style.display = isExpanded ? "block" : "none";
        // right.style.display = isExpanded ? "none" : "flex";
        // right.style.width = isExpanded ? "25%" : "100%";

        setExpanded(!isExpanded);
    };
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth > 1100) {
                let middle = document.querySelector(".side-middle") as HTMLDivElement;
                let right = document.querySelector(".side-right") as HTMLDivElement;
                middle.style.display = null;
                middle.style.width = null;
                right.removeAttribute("style");

                setExpanded(false);
            }

            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", onResize);
    }, [self_user]);

    useEffect(() => {
        (async () => {
            if (localStorage.getItem("access_token")) {
                const user = await fetchUserPrivate();
                setSelfUser(user);
                setNotifCount(user?.notifications?.length ?? 0);
            }
        })();

        socket.listen("update_notification_counter", (data) => {
            console.log("Notification Received:", data);
            setNotifCount((old) => ++old);
            setNotifColor("rgb(var(--orange))");
        });
    }, []);

    return (
        <>
            <div
                style={
                    window_width < 1100 || forceExpansion
                        ? {
                              display: "flex",
                              backgroundColor: "rgba(0,0,0,0.7)",
                              position: "absolute",
                              width: "100%",
                              borderLeft: "none",
                              opacity: !isExpanded ? "0" : "1",
                              transition: "all .2s",
                              visibility: !isExpanded ? "hidden" : "visible",
                          }
                        : {}
                }
                className="page-sides side-right"
            >
                <SettingsButton redirect="/home" iconClass="nf nf-fa-house" text="Home" style={undefined} />
                <SettingsButton
                    redirect="/notifications"
                    iconClass="nf nf-fa-bell"
                    force_redirect={false}
                    text={`Notifs (${notifCount})`}
                    style={{ color: notifColor }}
                />
                <SettingsButton redirect="/dms" iconClass="nf nf-fa-message" text="DMs" style={undefined} />
                <SettingsButton redirect="/most-used-hashtags" iconClass="nf nf-fa-hashtag" text="Hashtags" style={undefined} />
                <SettingsButton redirect="/bookmarks" iconClass="nf nf-fa-bookmark" text="Bookmarks" style={undefined} />
                <SettingsButton redirect="/shop" iconClass="nf nf-fa-shop" text="Shop" style={undefined} />
                <SettingsButton redirect="/search" iconClass="nf nf-oct-search" text="Search" style={undefined} />
                <SettingsButton redirect="/hives" iconClass="nf nf-md-beehive_outline" text="Hives" style={undefined} />
                <SettingsButton redirect="/settings" iconClass="nf nf-fa-cog" text="Settings" style={undefined} />
                {self_user ? (
                    self_user?.badges?.findIndex((x) => x == BadgeType.OWNER || x == BadgeType.MODERATOR) > -1 ? (
                        <SettingsButton redirect="/dashboard" iconClass="nf nf-fa-shield" text="Dashboard" style={undefined} />
                    ) : (
                        ""
                    )
                ) : (
                    ""
                )}

                <a onClick={() => navigate(`/profile/${self_user?.handle}`)} className="settings-button">
                    <div
                        style={{
                            backgroundImage: `url(${self_user?.avatar})`,
                            clipPath: AVATAR_SHAPES[self_user?.customization?.square_avatar]
                                ? AVATAR_SHAPES[self_user?.customization?.square_avatar].style
                                : "",
                            borderRadius:
                                AVATAR_SHAPES[self_user?.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                                    ? self_user?.customization?.square_avatar
                                        ? "5px"
                                        : "100%"
                                    : "100%",
                            verticalAlign: "middle",
                        }}
                        className="pfp"
                    ></div>{" "}
                    <span
                        style={{
                            fontFamily: self_user?.customization?.display_name?.font?.bought
                                ? self_user?.customization?.display_name?.font?.font_family
                                : "gordin",
                        }}
                    >
                        Profile
                    </span>
                </a>

                <SettingsButton redirect="/logout" style={{ color: "red" }} iconClass="nf nf-fa-right_from_bracket" text="Log out" />
            </div>
            {(window_width < 1100 || forceExpansion) && !disableIcon ? (
                <a onClick={ExpandRightSide} className="open-panel-button">
                    <i className="nf nf-md-arrow_collapse_left"></i>
                </a>
            ) : (
                ""
            )}
        </>
    );
}

export default RightSide;
