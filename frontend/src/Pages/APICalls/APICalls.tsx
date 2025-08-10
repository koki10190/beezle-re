import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import react from "react";
import "./APICalls.css";
import Divider from "../../Components/Divider";
import APICall from "./APICall";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import APICategory from "./APICategory";
import { Helmet } from "react-helmet";

function APICalls() {
    return (
        <>
            <Helmet>
                <title>Beezle: RE | API Calls</title>
            </Helmet>
            <div className="api-calls-page">
                <header className="api-header">
                    <div className="api-header-image"></div>
                    <h1 className="api-header-h1">Beezle API</h1>
                    <p>
                        Here you can find out every API call with it's <b>method</b>, <b>response</b>, and <b>required query/payload</b>. Keep in mind
                        that every call requires an <b>Authorization</b> header to be set with an user account. Some types are quite big so I didn't
                        type em out here, check them out{" "}
                        <a href="https://github.com/koki10190/beezle-re/tree/master/frontend/src/types" target="_blank" className="link">
                            Here (TypeScript)
                        </a>{" "}
                        &{" "}
                        <a href="https://github.com/koki10190/beezle-re/tree/master/backend/src/mongoose/structures" target="_blank" className="link">
                            Here (Rust)
                        </a>{" "}
                        instead
                    </p>
                </header>
                <Divider />
                <div className="api-calls-container">
                    <APICategory color="cat-blue" name="/api/user">
                        <APICall
                            response={{
                                message: "",
                                error: "optional",
                            }}
                            payload={{
                                handle: "string",
                                add: "bool",
                            }}
                            method="POST"
                            path="/api/user/add_notif"
                            desc={"Remove/Add notification from an user"}
                        />
                        <APICall
                            response={{
                                message: "",
                                error: "optional",
                            }}
                            payload={{
                                handle: "string",
                                block: "bool",
                            }}
                            method="POST"
                            path="/api/user/block"
                            desc={"Block/Unblock an user"}
                        />
                        <APICall
                            response={{
                                has: "bool",
                                error: "string/optional",
                            }}
                            payload={{
                                handle: "string",
                            }}
                            method="POST"
                            path="/api/user/check_has_notif"
                            desc={"Check if the authorized user has an user added in their notification list"}
                        />
                        <APICall
                            response={{
                                changed: "bool",
                                error: "optional, string",
                            }}
                            payload={null}
                            method="PATCH"
                            path="/api/user/clear_notifs"
                            desc={"Check if the authorized user has an user added in their notification list"}
                        />
                        <APICall
                            response={{
                                deleted: "bool",
                                error: "optional, string",
                            }}
                            payload={null}
                            method="DELETE"
                            path="/api/user/delete"
                            desc={"Delete the user from Authorization Token"}
                        />
                        <APICall
                            response={{
                                deleted: "bool",
                                error: "optional, string",
                            }}
                            payload={{
                                handle: "string",
                                follow: "bool",
                            }}
                            method="POST"
                            path="/api/user/follow"
                            desc={"Follow/Unfollow an user"}
                        />
                        <APICall
                            response={"typeof UserPublic (Check GitHub for UserPublic Type)"}
                            payload={{
                                handle: "string",
                            }}
                            method="GET"
                            path="/api/user"
                            desc={"Get user information using their handle"}
                        />
                        <APICall
                            response={"typeof UserPublic (Check GitHub for UserPublic Type)"}
                            payload={null}
                            method="GET"
                            path="/api/user/private"
                            desc={"Get user information using an Authorization Token"}
                        />
                        <APICall
                            response={{
                                is_blocked: "boolean",
                            }}
                            payload={{
                                who: "string",
                                by: "string",
                            }}
                            method="GET"
                            path="/api/user/is_blocked"
                            desc={"Check if 'who' is blocked by 'by'"}
                        />
                        <APICall
                            response={{
                                message: "string",
                                error: "string, optional",
                            }}
                            payload={{
                                emoji_url: "string, imgur only",
                                emoji_id: "string",
                            }}
                            method="POST"
                            path="/api/user/upload_emoji"
                            desc={"Upload a custom emoji, costs 500 of your coins"}
                        />
                    </APICategory>
                    <APICategory color="cat-yellow" name="/api/connections">
                        <APICall
                            response={"typeof Spotify.CurrentlyPlayingResponse (Check GitHub for full data or spotify's API)"}
                            payload={{
                                handle: "string",
                            }}
                            method="GET"
                            path="/api/connections/spotify/status"
                            desc={"Get someones Spotify Status"}
                        />
                        <APICall
                            response={"typeof Steam.PlayerSummary (Check GitHub for full data or spotify's API)" as any as object}
                            payload={{
                                steam_id: "string",
                            }}
                            method="GET"
                            path="/api/connections/steam_get"
                            desc={"Get someones steam 'Playing Game' status"}
                        />
                    </APICategory>
                    <APICategory name="/api/lastfm" color="cat-red">
                        <APICall
                            response={"typeof lastfm.NowPlaying (Check GitHub)"}
                            payload={{
                                username: "string",
                            }}
                            method="GET"
                            path="/api/lastfm/now_playing"
                            desc={"Get an users 'Now Playing'"}
                        />
                    </APICategory>
                    <APICategory name="/api/post" color="cat-green">
                        <APICall
                            response={"typeof Post (Check GitHub)"}
                            payload={{
                                post_id: "string",
                                remove_bookmark: "bool",
                            }}
                            method="POST"
                            path="/api/post/bookmark"
                            desc={"Bookmark a post"}
                        />
                        <APICall
                            response={"typeof Post (Check GitHub)"}
                            payload={{
                                content: "string",
                                replying_to: "string (if it is a reply, add a post id here)",
                                is_reply: "bool",
                            }}
                            method="POST"
                            path="/api/post/create"
                            desc={"Create a post"}
                        />
                        <APICall
                            response={{
                                message: "string",
                            }}
                            payload={{
                                post_id: "string",
                            }}
                            method="DELETE"
                            path="/api/post/delete"
                            desc={"Delete a post"}
                        />
                        <APICall
                            response={"typeof Post (Check GitHub)"}
                            payload={{
                                post_id: "string",
                                content: "string",
                            }}
                            method="PATCH"
                            path="/api/post/edit"
                            desc={"Edit one of your posts"}
                        />
                        <APICall
                            response={"typeof Post (Check GitHub)"}
                            payload={{
                                post_id: "string",
                                remove_like: "bool",
                            }}
                            method="PATCH"
                            path="/api/post/like"
                            desc={"Like a post"}
                        />
                        <APICall
                            response={"typeof Post (Check GitHub)"}
                            payload={{
                                post_id: "string",
                                remove_pin: "bool",
                            }}
                            method="POST"
                            path="/api/post/pin"
                            desc={"Pin a post"}
                        />
                        <APICall
                            response={"typeof Post (Check GitHub)"}
                            payload={{
                                post_id: "string",
                                emoji: "bool",
                            }}
                            method="POST"
                            path="/api/post/react"
                            desc={"React to a post with an emoji"}
                        />
                        <APICall
                            response={"typeof Post (Check GitHub)"}
                            payload={{
                                post_id: "string",
                                remove_repost: "bool",
                            }}
                            method="POST"
                            path="/api/post/repost"
                            desc={"Repost a post"}
                        />
                        <APICall
                            response={{
                                posts: "Array<typeof Post> (Check GitHub)",
                            }}
                            payload={{
                                search: "string",
                            }}
                            method="GET"
                            path="/api/post/search"
                            desc={"Search for a post using a @handle, Post ID or anything in a post's content"}
                        />
                        <APICall
                            response={{
                                posts: "Array<typeof Post> (Check GitHub)",
                                offset: "number (your offset + 5)",
                            }}
                            payload={{
                                offset: "number (i64)",
                            }}
                            method="GET"
                            path="/api/post/get/explore"
                            desc={"Get posts from explore"}
                        />
                        <APICall
                            response={{
                                posts: "Array<typeof Post> (Check GitHub)",
                                offset: "number (your offset + 5)",
                            }}
                            payload={{
                                offset: "number (i64)",
                                filter_users: "Array<string>",
                            }}
                            method="GET"
                            path="/api/post/get/following"
                            desc={"Get posts from filtered users"}
                        />
                        <APICall
                            response={{
                                posts: "Array<typeof Post> (Check GitHub)",
                                offset: "number (your offset + 5)",
                            }}
                            payload={{
                                offset: "number (i64)",
                            }}
                            method="GET"
                            path="/api/post/get/now"
                            desc={"Get posts from 'Right Now'"}
                        />
                        <APICall
                            response={{
                                posts: "Array<typeof Post> (Check GitHub)",
                                offset: "number (your offset + 5)",
                            }}
                            payload={{
                                offset: "number (i64)",
                                handle: "string",
                            }}
                            method="GET"
                            path="/api/post/get/profile"
                            desc={"Get posts from an user"}
                        />
                        <APICall
                            response={{
                                reacts: "Array<typeof React> (Check GitHub)",
                                offset: "number (your offset + 5)",
                            }}
                            payload={{
                                post_id: "string",
                            }}
                            method="GET"
                            path="/api/post/get/reacts"
                            desc={"Get posts reacts"}
                        />
                        <APICall
                            response={{
                                reacts: "Array<typeof Post> (Check GitHub)",
                                count: "number",
                            }}
                            payload={{
                                post_id: "string",
                            }}
                            method="GET"
                            path="/api/post/get/replies"
                            desc={"Get posts replies"}
                        />
                        <APICall
                            response={{
                                count: "number",
                            }}
                            payload={{
                                post_id: "string",
                            }}
                            method="GET"
                            path="/api/post/get/reply_count"
                            desc={"Get a reply count of a post"}
                        />
                        <APICall
                            response={{
                                posts: "Array<typeof Post> (Check GitHub)",
                                offset: "number (your offset + 5)",
                            }}
                            payload={{
                                offset: "number (i64)",
                                hashtag: "string",
                            }}
                            method="GET"
                            path="/api/post/hashtag/get"
                            desc={"Get posts from a hashtag"}
                        />
                        <APICall
                            response={{
                                hashtags: "Array<typeof Hashtag> (Check GitHub)",
                            }}
                            payload={null}
                            method="GET"
                            path="/api/post/hashtag/topten"
                            desc={"Get posts from a hashtag"}
                        />
                    </APICategory>
                    <APICategory name="/api">
                        <APICall
                            response={{
                                changed: "bool",
                            }}
                            payload={{
                                about_me: "string",
                            }}
                            method="PATCH"
                            path="/api/change_about_me"
                            desc={"Change 'About Me' section of your profile"}
                        />
                        <APICall
                            response={{
                                changed: "bool",
                            }}
                            payload={{
                                avatar: "string",
                            }}
                            method="PATCH"
                            path="/api/change_avatar"
                            desc={"Change the avatar of your user"}
                        />
                        <APICall
                            response={{
                                changed: "bool",
                            }}
                            payload={{
                                username: "string",
                            }}
                            method="PATCH"
                            path="/api/change_username"
                            desc={"Change the username of your user"}
                        />
                        <APICall
                            response={{
                                changed: "bool",
                            }}
                            payload={{
                                username: "string",
                                avatar: "string",
                                banner: "string",
                                about_me: "string",
                                activity: "string",
                                profile_gradient1: "string",
                                profile_gradient2: "string",
                                name_color1: "string",
                                name_color2: "string",
                                avatar_shape: "number (i64, Check GitHub for enum)",
                                profile_postbox_img: "string (not used/deprecated, set it as nothing)",
                            }}
                            method="PATCH"
                            path="/api/profile/edit"
                            desc={"Edit the entire profile"}
                        />
                        <APICall
                            response={{
                                token: "string",
                            }}
                            payload={{
                                email: "string",
                                password: "string",
                            }}
                            method="POST"
                            path="/api/login_user"
                            desc={"Get an access token of an account using an email & a password"}
                        />
                    </APICategory>
                    <br></br>
                </div>
            </div>
        </>
    );
}

export default APICalls;
