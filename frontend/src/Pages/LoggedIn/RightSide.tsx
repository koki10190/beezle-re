import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import React from "react";
import { checkToken } from "../../functions/checkToken";
import { BadgeType, UserPrivate } from "../../types/User";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { socket } from "../../ws/socket";
import { NotificationData } from "../../types/Notification";

function SettingsButton({
    redirect,
    iconClass,
    text,
    style,
}: {
    redirect: string;
    iconClass: string;
    text: string;
    style: any | undefined;
}) {
    return (
        <a style={style ? style : {}} href={redirect} className="settings-button">
            <i className={iconClass}></i> {text}
        </a>
    );
}

function RightSide() {
    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);
    const [isExpanded, setExpanded] = useState(false);
    const [window_width, setWindowWidth] = useState(window.innerWidth);
    const [notifCount, setNotifCount] = useState(0);

    const ExpandRightSide = () => {
        const middle = document.querySelector(".side-middle") as HTMLDivElement;
        const right = document.querySelector(".side-right") as HTMLDivElement;

        middle.style.display = isExpanded ? "block" : "none";
        right.style.display = isExpanded ? "none" : "flex";
        right.style.width = isExpanded ? "25%" : "100%";

        setExpanded(!isExpanded);
    };
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth > 1100) {
                let middle = document.querySelector(".side-middle") as HTMLDivElement;
                let right = document.querySelector(".side-right") as HTMLDivElement;
                middle.removeAttribute("style");
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
                setNotifCount(user!.notifications.length);
            }
        })();

        socket.listen("get-notif", (_: object) => {
            const data = _ as NotificationData;
            console.log("get-notif", data);
            setNotifCount(notifCount + 1);
            // if (!localStorage.getItem("notifs")) localStorage.setItem("notifs", "[]");

            // localStorage.setItem("notifs", JSON.stringify([data, ...JSON.parse(localStorage.getItem("notifs")!)]));
        });
    }, []);

    return (
        <>
            <div className="page-sides side-right">
                <SettingsButton redirect="/home" iconClass="fa-solid fa-house" text="Home" style={undefined} />
                <SettingsButton
                    redirect="/notifications"
                    iconClass="fa-solid fa-bell"
                    text={`Notifs (${notifCount})`}
                    style={undefined}
                />
                <SettingsButton redirect="/explore" iconClass="fa-solid fa-globe" text="Explore" style={undefined} />
                <SettingsButton
                    redirect="/right-now"
                    iconClass="fa-solid fa-sparkles"
                    text="Right Now"
                    style={undefined}
                />
                <SettingsButton
                    redirect="/bookmarks"
                    iconClass="fa-solid fa-bookmark"
                    text="Bookmarks"
                    style={undefined}
                />
                <SettingsButton redirect="/shop" iconClass="fa-solid fa-shop" text="Shop" style={undefined} />
                <SettingsButton
                    redirect="/shop"
                    iconClass="fa-solid fa-magnifying-glass"
                    text="Search"
                    style={undefined}
                />
                <SettingsButton redirect="/settings" iconClass="fa-solid fa-cog" text="Settings" style={undefined} />
                {self_user ? (
                    self_user.badges.findIndex(x => x == BadgeType.OWNER || x == BadgeType.MODERATOR) > -1 ? (
                        <SettingsButton
                            redirect="/dashboard"
                            iconClass="fa-solid fa-shield"
                            text="Dashboard"
                            style={undefined}
                        />
                    ) : (
                        ""
                    )
                ) : (
                    ""
                )}

                <a href={`/profile/${self_user?.handle}`} className="settings-button">
                    <div
                        style={{
                            backgroundImage: `url(${self_user?.avatar})`,
                            borderRadius: self_user?.customization?.square_avatar ? "15px" : "100%",
                        }}
                        className="pfp"
                    ></div>{" "}
                    Profile
                </a>

                <SettingsButton
                    redirect="/logout"
                    style={{ color: "red" }}
                    iconClass="fa-solid fa-right-from-bracket"
                    text="Log out"
                />
            </div>
            {window_width < 1100 ? (
                <a onClick={ExpandRightSide} className="open-panel-button">
                    <i className="fa-solid fa-left-to-line"></i>
                </a>
            ) : (
                ""
            )}
        </>
    );
}

export default RightSide;
