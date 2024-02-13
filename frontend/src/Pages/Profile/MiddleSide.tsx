import axios from "axios";
import { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import React from "react";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import "./Profile.css";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import { BadgesToJSX } from "../../functions/badgesToJSX";
import RepToParagraph from "../../Components/RepToParagraph";
import { Post } from "../../types/Post";
import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import SetLevelColor from "../../functions/SetLevelColor";
import Username from "../../Components/Username";
import pSBC from "../../functions/ShadeColor";
import ShadeColor from "../../functions/ShadeColor";

function Loading() {
    return (
        <div className="page-sides side-middle">
            <div className="profile">
                <div className="pfp"></div>
                <p className="username"></p>
                <p className="handle"></p>
            </div>
        </div>
    );
}

function Loaded({ user, self }: { user: UserPublic | UserPrivate; self: UserPrivate | null }) {
    const [isFollowing, setFollowing] = useState(user.followers.find(x => x === self?.handle) ? true : false);
    const [followingCount, setFollowingCount] = useState(user.following.length);
    const [followersCount, setFollowersCount] = useState(user.followers.length);
    const [followsYou, setFollowsYou] = useState(self.followers.find(x => x === user.handle) ? true : false);
    const [bgGradient, setBgGradient] = useState(
        `linear-gradient(-45deg, ${ShadeColor(
            user.customization?.profile_gradient ? user.customization.profile_gradient.color1 : "#000000",
            -75
        )}, ${ShadeColor(
            user.customization?.profile_gradient ? user.customization.profile_gradient.color2 : "#000000",
            -75
        )})`
    );
    const [gradient, setGradient] = useState(
        `linear-gradient(45deg, ${ShadeColor(
            user.customization?.profile_gradient ? user.customization.profile_gradient.color1 : "#000000",
            -25
        )}, ${ShadeColor(
            user.customization?.profile_gradient ? user.customization.profile_gradient.color2 : "#000000",
            -25
        )})`
    );
    const levelBox = useRef<HTMLSpanElement>(null);

    const FollowInteraction = async () => {
        const res = await axios.post(`${api_uri}/api/user/follow`, {
            token: localStorage.getItem("access_token"),
            handle: user.handle,
            follow: !isFollowing,
        });

        setFollowersCount(!isFollowing ? followersCount + 1 : followersCount - 1);
        setFollowing(!isFollowing);
    };

    const [allPosts, setAllPosts] = useState<Array<Post>>([]);
    const [posts, setPosts] = useState<Array<Post>>([]);
    const [postOffset, setPostOffset] = useState(0);

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target! as HTMLDivElement;
        if (!(element.scrollHeight - element.scrollTop === element.clientHeight)) return;

        // detected bottom

        console.log("at bottom!");

        const posts = (await axios.get(`${api_uri}/api/post/get/profile?handle=${user.handle}&offset=${postOffset}`))
            .data;
        setPosts(old => [...old, ...posts.posts]);
        setPostOffset(posts.offset);

        // setPosts(old => [...old, ...allPosts.splice(postOffset, postOffset + 5)]);
    };

    useEffect(() => {
        (async () => {
            const posts = (
                await axios.get(`${api_uri}/api/post/get/profile?handle=${user.handle}&offset=${postOffset}`)
            ).data;
            setPosts(posts.posts);
            setPostOffset(posts.offset);
        })();
    }, []);

    useEffect(() => {
        SetLevelColor(user, levelBox.current!);
    }, [levelBox]);

    return (
        <div
            style={{
                background: bgGradient,
            }}
            onScroll={handleScroll}
            className="page-sides side-middle"
        >
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
                        borderRadius: user.customization?.square_avatar ? "15px" : "100%",
                    }}
                    className="pfp"
                ></div>
                <p className="username">
                    <Username user={user} /> <BadgesToJSX badges={user.badges} className="profile-badge" />
                </p>
                <p className="handle">@{user.handle} </p>
                <p style={{ color: "white", marginTop: "-20px", fontSize: "20px" }} className="handle">
                    <span
                        className="test-gradient"
                        // style={{
                        // 	background: "-webkit-linear-gradient(45deg, #fc0b03, #0398fc)",
                        // 	WebkitBackgroundClip: "text",
                        // 	WebkitTextFillColor: "transparent",
                        // }}
                    >
                        Level{" "}
                        <span ref={levelBox} className="level-box">
                            {user.levels
                                ? user.levels.level
                                    ? user.levels.level.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : 0
                                : (0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>
                            {" - XP "}{" "}
                            {user.levels
                                ? user.levels.xp
                                    ? user.levels.xp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : 0
                                : (0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            /1,000
                        </span>
                    </span>
                </p>
                <div className="inline-stats">
                    <p>
                        <i style={{ color: "rgb(255, 208, 108)" }} className="fa-solid fa-coins"></i>{" "}
                        {user.coins.toLocaleString("en-US")}
                    </p>
                    <RepToParagraph reputation={user.reputation} />
                </div>
                {followsYou ? <p className="follows-you">Follows you</p> : ""}

                {user.handle === self?.handle ? (
                    <button
                        onClick={() => (window.location.href = "/edit/profile")}
                        className="button-field profile-edit-button"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <button onClick={FollowInteraction} className="button-field profile-edit-button">
                        {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                )}
                {user.about_me !== "" ? (
                    <div
                        style={{
                            background: gradient,
                        }}
                        className="profile-container"
                    >
                        <p className="profile-container-header">About Me</p>
                        <p className="about_me">{user.about_me}</p>
                    </div>
                ) : (
                    <></>
                )}
                <div
                    style={{
                        background: gradient,
                    }}
                    className="profile-container"
                >
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
                {user.activity.replace(/ /g, "") != "" ? (
                    <div
                        style={{
                            background: gradient,
                        }}
                        className="profile-container"
                    >
                        <p className="profile-container-header">Activity</p>
                        <p className="about_me">{user.activity}</p>
                    </div>
                ) : (
                    ""
                )}
                <div className="followers-and-following">
                    <a href={`/following/${user.handle}`}>
                        Following <span>{followingCount}</span>
                    </a>
                    <a href={`/followers/${user.handle}`}>
                        Followers <span>{followersCount}</span>
                    </a>
                </div>
                <Divider />
                {posts.map((post: Post) => {
                    return (
                        <PostBox setPosts={setPosts} self_user={self as UserPrivate} key={post.post_id} post={post} />
                    );
                })}
            </div>
        </div>
    );
}

function MiddleSide({ handle }: { handle: string }) {
    const [user, setUser] = useState<UserPublic | UserPrivate | null>(null);
    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);

    useEffect(() => {
        (async () => {
            if (localStorage.getItem("access_token")) {
                setSelfUser(await fetchUserPrivate());
            }
            setUser(await fetchUserPublic(handle));
            console.log("use effect in middelside");
        })();
    }, []);

    return <>{user ? <Loaded user={user} self={self_user} /> : <Loading />}</>;
}

export default MiddleSide;
