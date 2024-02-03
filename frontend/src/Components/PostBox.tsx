import axios from "axios";
import { FormEvent, LegacyRef, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import "./PostBox.css";
import moment from "moment";
import { UserPrivate, UserPublic } from "../types/User";
import { Post } from "../types/Post";
import { fetchUserPublic } from "../functions/fetchUserPublic";
import { api_uri } from "../links";
import FlipNumbers from "react-flip-numbers";
import millify from "millify";

interface PostBoxData {
    post: Post;
    self_user: UserPrivate;
    setPosts: any;
}

function PostBox({ post, self_user, setPosts }: PostBoxData) {
    const [user, setUser] = useState<UserPublic>();
    const [isLiked, setLiked] = useState(false);
    const [isReposted, setReposted] = useState(false);
    const [isBookmarked, setBookmarked] = useState(false);
    const [LikeCount, setLikeCount] = useState(post.likes.length);
    const [RepostCount, setRepostCount] = useState(post.reposts.length);

    const [isLikeHovered, setLikeHovered] = useState(false);
    const [isRepostHovered, setRepostHovered] = useState(false);

    useEffect(() => {
        (async () => {
            if (post.repost) {
                setUser((await fetchUserPublic(post.post_op_handle)) as UserPublic);
            } else {
                setUser((await fetchUserPublic(post.handle)) as UserPublic);
            }

            setLiked(post.likes.find(s => s === self_user.handle) ? true : false);
            setReposted(post.reposts.find(s => s === self_user.handle) ? true : false);
            setBookmarked(self_user.bookmarks.find(s => s === post.post_id) ? true : false);
        })();
    }, []);

    useEffect(() => {
        console.log("Post", post.content, "Handle", post.handle);
    }, [user]);

    const LikeInteraction = async () => {
        if (isLiked) {
            await axios.post(`${api_uri}/api/post/like`, {
                token: localStorage.getItem("access_token"),
                post_id: post.post_id,
                remove_like: true,
            });
            setLiked(false);
            setLikeCount(LikeCount - 1);
            return;
        }

        await axios.post(`${api_uri}/api/post/like`, {
            token: localStorage.getItem("access_token"),
            post_id: post.post_id,
            remove_like: false,
        });
        setLiked(true);
        setLikeCount(LikeCount + 1);
    };

    const RepostInteraction = async () => {
        if (isReposted) {
            await axios.post(`${api_uri}/api/post/repost`, {
                token: localStorage.getItem("access_token"),
                post_id: post.post_id,
                remove_repost: true,
            });
            setReposted(false);
            setRepostCount(RepostCount - 1);

            return;
        }

        const res = await axios.post(`${api_uri}/api/post/repost`, {
            token: localStorage.getItem("access_token"),
            post_id: post.post_id,
            remove_repost: false,
        });

        setReposted(true);
        setRepostCount(RepostCount + 1);
    };

    const BookmarkInteraction = async () => {
        if (isBookmarked) {
            await axios.post(`${api_uri}/api/post/bookmark`, {
                token: localStorage.getItem("access_token"),
                post_id: post.post_id,
                remove_bookmark: true,
            });
            setReposted(false);

            if (setPosts) {
                setPosts((old: Array<Post>) => {
                    old.splice(
                        old.findIndex(x => x.post_id == post.post_id),
                        1
                    );
                    return [...old];
                });
            }

            return;
        }

        const res = await axios.post(`${api_uri}/api/post/bookmark`, {
            token: localStorage.getItem("access_token"),
            post_id: post.post_id,
            remove_bookmark: false,
        });

        setBookmarked(true);
    };

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
                            ? moment(new Date(parseInt(post.creation_date.$date.$numberLong)))
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
            {user ? (
                <div className="post-interaction-btn">
                    <a
                        onMouseEnter={() => setLikeHovered(true)}
                        onMouseLeave={() => setLikeHovered(false)}
                        onClick={LikeInteraction}
                        style={isLiked ? { color: "rgb(255, 73, 73)" } : {}}
                        className="post-inter-red"
                    >
                        <i className=" fa-solid fa-heart"></i>{" "}
                        <FlipNumbers
                            height={15}
                            width={15}
                            color=""
                            play
                            nonNumberClassName="like-flip"
                            numberClassName="like-flip"
                            perspective={100}
                            numbers={millify(LikeCount)}
                        />
                    </a>
                    <a
                        style={isReposted ? { color: "rgb(60, 255, 86)" } : {}}
                        onClick={RepostInteraction}
                        className="post-inter-lime"
                    >
                        <i className=" fa-solid fa-repeat"></i>{" "}
                        <FlipNumbers
                            height={15}
                            width={15}
                            color=""
                            play
                            nonNumberClassName="like-flip"
                            numberClassName="like-flip"
                            perspective={100}
                            numbers={millify(RepostCount)}
                        />
                    </a>
                    <a
                        onClick={BookmarkInteraction}
                        style={isBookmarked ? { color: "rgb(60, 193, 255)" } : {}}
                        className="post-inter-blue"
                    >
                        <i className=" fa-solid fa-bookmark"></i>
                    </a>
                </div>
            ) : (
                ""
            )}
        </div>
    );
}

export default PostBox;
