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

    useEffect(() => {
        (async () => {
            if (localStorage.getItem("access_token")) {
                setSelfUser(await fetchUserPrivate());
            }
        })();
    }, [self_user]);

    return (
        <div className="page-sides side-right">
            <SettingsButton redirect="/home" iconClass="fa-solid fa-house" text="Home" style={undefined} />
            <SettingsButton redirect="/notifs" iconClass="fa-solid fa-bell" text="Notifications" style={undefined} />
            <SettingsButton redirect="/explore" iconClass="fa-solid fa-globe" text="Explore" style={undefined} />
            <SettingsButton redirect="/right-now" iconClass="fa-solid fa-sparkles" text="Right Now" style={undefined} />
            <SettingsButton redirect="/bookmarks" iconClass="fa-solid fa-bookmark" text="Bookmarks" style={undefined} />
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
    );
}

export default RightSide;
