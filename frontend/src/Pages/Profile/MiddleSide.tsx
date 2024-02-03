import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import React from "react";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import "./Profile.css";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import { BadgesToJSX } from "../../functions/badgesToJSX";

function Loading() {
    return (
        <div className="profile">
            <div className="pfp"></div>
            <p className="username"></p>
            <p className="handle"></p>
        </div>
    );
}

function Loaded({ user, self }: { user: UserPublic | UserPrivate; self: UserPrivate | null }) {
    return (
        <div className="profile">
            <div
                style={{
                    backgroundImage: `url(${user.banner})`,
                }}
                className="banner"
            ></div>
            <div
                style={{
                    backgroundImage: `url(${user.avatar})`,
                }}
                className="pfp"
            ></div>
            <p className="username">
                {user.username} <BadgesToJSX badges={user.badges} className="profile-badge" />
            </p>
            <p className="handle">@{user.handle}</p>
            <button
                onClick={() => window.location.replace("/edit/profile")}
                className="button-field profile-edit-button"
            >
                Edit Profile
            </button>
            {user.about_me !== "" ? (
                <div className="profile-container">
                    <p className="profile-container-header">About Me</p>
                    <p className="about_me">{user.about_me}</p>
                </div>
            ) : (
                <></>
            )}
            <div className="profile-container">
                <p className="profile-container-header">Joined At</p>
                <p className="about_me">
                    {new Date(parseInt(user.creation_date.$date.$numberLong)).toLocaleString("default", {
                        month: "long",
                    })}{" "}
                    {new Date(parseInt(user.creation_date.$date.$numberLong)).getDay()}
                    {", "}
                    {new Date(parseInt(user.creation_date.$date.$numberLong)).getFullYear()}
                </p>
            </div>
        </div>
    );
}

function MiddleSide({ handle }: { handle: string }) {
    checkToken();
    const [user, setUser] = useState<UserPublic | UserPrivate | null>(null);
    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);

    useEffect(() => {
        (async () => {
            if (localStorage.getItem("access_token")) {
                setSelfUser(await fetchUserPrivate());
            }
            setUser(await fetchUserPublic(handle));
        })();
    }, []);

    return <div className="page-sides side-middle">{user ? <Loaded user={user} self={self_user} /> : <Loading />}</div>;
}

export default MiddleSide;
