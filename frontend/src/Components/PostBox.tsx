import axios from "axios";
import { FormEvent, LegacyRef, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import "./PostBox.css";
import moment from "moment";
import { UserPublic } from "../types/User";
import { Post } from "../types/Post";
import { fetchUserPublic } from "../functions/fetchUserPublic";

interface PostBoxData {
    post: Post;
}

function PostBox({ post }: PostBoxData) {
    const [user, setUser] = useState<UserPublic>();

    useEffect(() => {
        (async () => {
            if (post.repost) {
                setUser((await fetchUserPublic(post.post_op_handle)) as UserPublic);
            } else {
                setUser((await fetchUserPublic(post.handle)) as UserPublic);
            }
        })();
    }, []);

    useEffect(() => {
        console.log("Post", post.content, "Handle", post.handle);
    }, [user]);

    return (
        <div className="post-box">
            {post.repost ? (
                <h4 onClick={() => window.location.replace(`/profile/${post.handle}`)} className="post-attr">
                    <i className="fa-solid fa-repeat"></i> Repost by @{post.handle}
                </h4>
            ) : (
                ""
            )}
            <div
                style={{
                    backgroundImage: `url(${user ? user.avatar : ""})`,
                }}
                className="pfp"
            ></div>
            <div onClick={() => window.location.replace(`/profile/${user ? user.handle : ""}`)} className="user-detail">
                <p className="username">{user ? user.username : ""}</p>
                <p className="handle">
                    @{user ? user.handle : ""}{" "}
                    <span style={{ color: "white" }}>
                        -{" "}
                        {user
                            ? moment(new Date(parseInt(user.creation_date.$date.$numberLong)))
                                  .fromNow(true)
                                  .replace("minutes", "m")
                                  .replace(" ", "")
                                  .replace("hours", "h")
                                  .replace("afew seconds", "1s")
                                  .replace("aminute", "1m")
                                  .replace("ahour", "1h")
                                  .replace("anhour", "1h")
                                  .replace("aday", "1d")
                                  .replace("days", "d")
                                  .replace("day", "1d")
                                  .replace("months", " months")
                                  .replace("amonth", "1 month")
                            : "0"}
                    </span>
                </p>
            </div>
            <p className="content">{post.content}</p>
        </div>
    );
}

export default PostBox;
