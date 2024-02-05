import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import React from "react";
import { checkToken } from "../../functions/checkToken";
import { UserPrivate } from "../../types/User";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";

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
    checkToken();

    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);
    const [isExpanded, setExpanded] = useState(false);
    const [window_width, setWindowWidth] = useState(window.innerWidth);

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

        (async () => {
            if (localStorage.getItem("access_token")) {
                setSelfUser(await fetchUserPrivate());
            }
        })();
    }, [self_user]);

    return (
        <>
            <div className="page-sides side-right">
                <SettingsButton redirect="/home" iconClass="fa-solid fa-house" text="Home" style={undefined} />
                <SettingsButton
                    redirect="/notifs"
                    iconClass="fa-solid fa-bell"
                    text="Notifications"
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
                <SettingsButton redirect="/settings" iconClass="fa-solid fa-cog" text="Settings" style={undefined} />

                <a href={`/profile/${self_user?.handle}`} className="settings-button">
                    <div style={{ backgroundImage: `url(${self_user?.avatar})` }} className="pfp"></div> Profile
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
