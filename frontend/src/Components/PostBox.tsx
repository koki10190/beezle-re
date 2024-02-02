import axios from "axios";
import { FormEvent, LegacyRef, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import "./PostBox.css";
import moment from "moment";
import { UserPublic } from "../types/User";

interface PostBoxData {
    post: {
        date: Date;
        content: string;
    };
    user: UserPublic;
}

function PostBox({ post, user }: PostBoxData) {
    return (
        <div className="post-box">
            <div
                style={{
                    backgroundImage: `url(${user.avatar})`,
                }}
                className="pfp"
            ></div>
            <div onClick={() => window.location.replace(`/profile/${user.handle}`)} className="user-detail">
                <p className="username">{user.username}</p>
                <p className="handle">
                    @{user.handle}{" "}
                    <span style={{ color: "white" }}>
                        -{" "}
                        {moment(post.date)
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
                            .replace("amonth", "1 month")}
                    </span>
                </p>
            </div>
            <p className="content">{post.content}</p>
        </div>
    );
}

export default PostBox;
