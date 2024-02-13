import axios from "axios";
import { FormEvent, LegacyRef, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import "./PostBox.css";
import moment from "moment";
import { UserPrivate, UserPublic } from "../types/User";
import { Post } from "../types/Post";
import { fetchUserPublic } from "../functions/fetchUserPublic";
import { api_uri } from "../links";
import FlipNumbers from "react-flip-numbers";
import millify from "millify";
import { BadgesToJSX } from "../functions/badgesToJSX";
import { socket } from "../ws/socket";
import ReactDOMServer from "react-dom/server";
import ImageEmbed from "./ImageEmbed";
import VideoEmbed from "./VideoEmbed";
import sanitize from "sanitize-html";
import parseURLs from "../functions/parseURLs";
import RepToIcon from "./RepToIcon";
import Username from "./Username";

interface FollowBoxData {
    handle: string;
    self_user: UserPrivate;
}

function FollowBox({ handle, self_user }: FollowBoxData) {
    const [user, setUser] = useState<UserPublic>();
    const [isFollowing, setFollowing] = useState(false);

    useEffect(() => {
        (async () => {
            const _user = (await fetchUserPublic(handle)) as UserPublic;
            setUser(_user);
            setFollowing(_user.followers.find(x => x === self_user.handle) ? true : false);
        })();
    }, []);

    if (!user) {
        return <></>;
    }

    const FollowInteraction = async (e: UIEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const res = await axios.post(`${api_uri}/api/user/follow`, {
            token: localStorage.getItem("access_token"),
            handle: user.handle,
            follow: !isFollowing,
        });

        setFollowing(!isFollowing);
    };

    return (
        <div className="post-box">
            <div onClick={() => (window.location.href = `/profile/${user ? user.handle : ""}`)} className="user-detail">
                <div
                    style={{
                        backgroundImage: `url(${user ? user.avatar : ""})`,
                    }}
                    className="pfp-post"
                ></div>
                <p className="username-post">
                    {user ? <Username user={user} /> : ""}{" "}
                    <BadgesToJSX badges={user ? user.badges : []} className="profile-badge profile-badge-shadow" />
                </p>
                <p className="handle-post">
                    @{user ? user.handle : ""}
                    {user ? (
                        <>
                            {" "}
                            <RepToIcon reputation={user.reputation} />
                        </>
                    ) : (
                        ""
                    )}{" "}
                    {user?.activity.replace(/ /g, "") !== "" && user ? (
                        <span style={{ color: "white" }}>
                            - {sanitize(user.activity.replace(/(.{35})..+/, "$1…"), { allowedTags: [] })}
                        </span>
                    ) : (
                        ""
                    )}
                </p>
                <p
                    style={{
                        whiteSpace: "pre-line",
                    }}
                >
                    {user.about_me}
                </p>
                {user.handle !== self_user.handle ? (
                    <button
                        onClick={FollowInteraction}
                        style={{ width: "100%", fontSize: "20px" }}
                        className="button-field"
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}

export default FollowBox;
