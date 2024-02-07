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
import { BadgesToJSX } from "../functions/badgesToJSX";
import { socket } from "../ws/socket";
import ReactDOMServer from "react-dom/server";
import ImageEmbed from "./ImageEmbed";
import VideoEmbed from "./VideoEmbed";

interface PostBoxData {
    post: Post;
    self_user: UserPrivate;
    setPosts: any;
    delete_post_on_bookmark_remove?: boolean;
    allow_reply_attribute?: boolean;
}

function parseURLs(content: string): string {
    let htmlToEmbed = "";
    {
        const matched = content.match(/\bhttps?:\/\/media\.tenor\.com\S+/gi);

        let i = 0;
        matched?.forEach(match => {
            content = content.replace(match, "");
            if (i > 2) return;

            const isVideo = match.match(/.mp4|.wmv/gi) ? true : false;
            const embed = ReactDOMServer.renderToStaticMarkup(
                isVideo ? <VideoEmbed url={match} /> : <ImageEmbed url={match} />
            );
            htmlToEmbed += embed;
            i++;
        });
    }

    {
        const matched = content.match(/\bhttps?:\/\/i\.tenor\.com\S+/gi);

        let i = 0;
        matched?.forEach(match => {
            content = content.replace(match, "");
            if (i > 2) return;

            const isVideo = match.match(/.mp4|.wmv/gi) ? true : false;
            const embed = ReactDOMServer.renderToStaticMarkup(
                isVideo ? <VideoEmbed url={match} /> : <ImageEmbed url={match} />
            );
            htmlToEmbed += embed;
            i++;
        });
    }

    {
        const matched = content.match(/\bhttps?:\/\/i\.imgur\.com\S+/gi);

        let i = 0;
        matched?.forEach(match => {
            content = content.replace(match, "");
            if (i > 2) return;

            const isVideo = match.match(/.mp4|.wmv/gi) ? true : false;
            const embed = ReactDOMServer.renderToStaticMarkup(
                isVideo ? <VideoEmbed url={match} /> : <ImageEmbed url={match} />
            );
            htmlToEmbed += embed;
            i++;
        });
    }

    return content + "<br/>" + htmlToEmbed;
}

function PostBox({
    post,
    self_user,
    setPosts,
    delete_post_on_bookmark_remove = false,
    allow_reply_attribute = false,
}: PostBoxData) {
    const [user, setUser] = useState<UserPublic>();
    const [isLiked, setLiked] = useState(false);
    const [isReposted, setReposted] = useState(false);
    const [isBookmarked, setBookmarked] = useState(false);
    const [LikeCount, setLikeCount] = useState(post.likes.length);
    const [RepostCount, setRepostCount] = useState(post.reposts.length);
    const [ReplyCount, setReplyCount] = useState(0);

    const [isLikeHovered, setLikeHovered] = useState(false);
    const [isRepostHovered, setRepostHovered] = useState(false);
    const [replyingToPost, setReplyingToPost] = useState<Post>();

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
            setReplyCount(
                (await axios.get(`${api_uri}/api/post/get/reply_count?post_id=${post.post_id}`)).data.count as number
            );

            if (post.is_reply) {
                setReplyingToPost((await axios.get(`${api_uri}/api/post/get/one?post_id=${post.replying_to}`)).data);
            }
        })();
    }, []);

    useEffect(() => {
        console.log("Post", post.content, "Handle", post.handle);
    }, [user]);

    const ReplyInteraction = async () => {
        window.location.href = `/post/${post.post_id}`;
    };

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

        console.log("CHANNEL: notification");
        socket.send("notification", {
            handle: self_user.handle,
            post,
            message: "liked your post!",
        });

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
            setBookmarked(false);

            if (setPosts && delete_post_on_bookmark_remove) {
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

    const [isEditing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [finalContent, setFinalContent] = useState(post.content);
    const [isPostEdited, setPostEdited] = useState(post.edited);

    const EditInteraction = async () => {
        setEditing(!isEditing);
    };

    const SaveEditChanges = async () => {
        setEditing(false);
        const res = await axios.post(`${api_uri}/api/post/edit`, {
            token: localStorage.getItem("access_token"),
            post_id: post.post_id,
            content: editContent,
        });

        if (res.data.error) {
            alert(res.data.error);
        } else {
            alert("Edited post successfully.");
            setFinalContent(editContent);
        }

        setPostEdited(true);
    };

    const DeleteInteraction = async () => {
        const res = await axios.post(`${api_uri}/api/post/delete`, {
            token: localStorage.getItem("access_token"),
            post_id: post.post_id,
        });

        if (res.data.error) {
            alert(res.data.error);
        } else {
            alert(res.data.message);
            if (setPosts) {
                setPosts((old: Array<Post>) => {
                    old.splice(
                        old.findIndex(x => x.post_id == post.post_id),
                        1
                    );
                    return [...old];
                });
            }
        }
    };

    return (
        <div className="post-box">
            {post.repost ? (
                <h4 onClick={() => (window.location.href = `/profile/${post.handle}`)} className="post-attr">
                    <i className="fa-solid fa-repeat"></i> Repost by @{post.handle}
                </h4>
            ) : (
                ""
            )}

            {isPostEdited ? (
                <h4 className="post-attr">
                    <i className="fa-solid fa-pencil"></i> Edited
                </h4>
            ) : (
                ""
            )}

            {allow_reply_attribute && post.is_reply ? (
                <h4 onClick={() => (window.location.href = `/post/${post.replying_to}`)} className="post-attr">
                    <i className="fa-solid fa-comment"></i> Replying to{" "}
                    {replyingToPost?.content.replace(/(.{12})..+/, "$1…")}
                </h4>
            ) : (
                ""
            )}
            <div
                style={{
                    backgroundImage: `url(${user ? user.avatar : ""})`,
                }}
                className="pfp-post"
            ></div>
            <div onClick={() => (window.location.href = `/profile/${user ? user.handle : ""}`)} className="user-detail">
                <p className="username-post">
                    {user ? user.username : ""}{" "}
                    <BadgesToJSX badges={user ? user.badges : []} className="profile-badge profile-badge-shadow" />
                </p>
                <p className="handle-post">
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
            {isEditing ? (
                <>
                    <textarea
                        placeholder="Edit Post"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="input-field"
                    ></textarea>
                    <button
                        onClick={SaveEditChanges}
                        style={{ marginTop: "10px" }}
                        className="button-field shadow fixed-100"
                    >
                        Save Changes
                    </button>
                </>
            ) : (
                <p
                    dangerouslySetInnerHTML={{
                        __html: parseURLs(finalContent),
                    }}
                    className="content"
                ></p>
            )}
            {user ? (
                <div className="post-interaction-btn">
                    <a onClick={ReplyInteraction} className="post-inter-blue">
                        <i className=" fa-solid fa-comment"></i>{" "}
                        <FlipNumbers
                            height={15}
                            width={15}
                            color=""
                            play
                            nonNumberClassName="like-flip"
                            numberClassName="like-flip"
                            perspective={100}
                            numbers={millify(ReplyCount)}
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
                        onClick={BookmarkInteraction}
                        style={isBookmarked ? { color: "rgb(60, 193, 255)" } : {}}
                        className="post-inter-blue"
                    >
                        <i className=" fa-solid fa-bookmark"></i>
                    </a>

                    {self_user.handle == post.handle && !post.repost ? (
                        <>
                            <a onClick={EditInteraction} className="post-inter">
                                <i className=" fa-solid fa-pen-to-square"></i>
                            </a>
                            <a onClick={DeleteInteraction} className="post-inter-red">
                                <i className=" fa-solid fa-trash"></i>
                            </a>
                        </>
                    ) : (
                        ""
                    )}
                </div>
            ) : (
                ""
            )}
        </div>
    );
}

export default PostBox;
