import { useEffect, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import FetchPost from "../../functions/FetchPost";
import { api_uri } from "../../links";
import axios from "axios";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import { useParams } from "react-router-dom";
import "./Post.css";
import moment from "moment";
import { BadgesToJSX } from "../../functions/badgesToJSX";
import FlipNumbers from "react-flip-numbers";
import millify from "millify";
import PostTyper from "../../Components/PostTyper";

function MiddleSide() {
    const { post_id } = useParams();
    const [post, setPost] = useState<Post>();
    const [replies, setReplies] = useState<Array<Post>>([]);
    const [self_user, setSelfUser] = useState<UserPrivate>();
    const [post_user, setPostUser] = useState<UserPublic>();
    const [isRepost, setIsRepost] = useState(false);
    const [isLiked, setLiked] = useState(false);
    const [isReposted, setReposted] = useState(false);
    const [isBookmarked, setBookmarked] = useState(false);
    const [LikeCount, setLikeCount] = useState(0);
    const [RepostCount, setRepostCount] = useState(0);

    const [isLikeHovered, setLikeHovered] = useState(false);
    const [isRepostHovered, setRepostHovered] = useState(false);

    const [isEditing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [finalContent, setFinalContent] = useState("");
    const [isPostEdited, setPostEdited] = useState(false);

    useEffect(() => {
        (async () => {
            const user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(user);

            console.log("foreach");
            const replies_res = await axios.get(`${api_uri}/api/post/get/replies?post_id=${post_id}`);
            const post_res = await axios.get(`${api_uri}/api/post/get/one?post_id=${post_id}`);
            const priv = (await fetchUserPrivate()) as UserPrivate;
            setReplies(replies_res.data.replies);
            setSelfUser(priv);
            setIsRepost(post_res.data.repost);
            setPost(post_res.data);
            setPostUser(
                (await fetchUserPublic(
                    post_res.data.repost ? post_res.data.post_op_handle : post_res.data.handle
                )) as UserPublic
            );

            setLiked((post_res.data as Post).likes.find(s => s === priv.handle) ? true : false);
            setReposted((post_res.data as Post).reposts.find(s => s === priv.handle) ? true : false);
            setBookmarked(priv.bookmarks.find(s => s === (post_res.data as Post).post_id) ? true : false);
            setLikeCount((post_res.data as Post).likes.length);
            setRepostCount((post_res.data as Post).reposts.length);

            setEditContent(post_res.data.content);
            setFinalContent(post_res.data.content);
            setPostEdited(post_res.data.edited);
        })();
    }, []);

    const LikeInteraction = async () => {
        if (isLiked) {
            await axios.post(`${api_uri}/api/post/like`, {
                token: localStorage.getItem("access_token"),
                post_id: post!.post_id,
                remove_like: true,
            });
            setLiked(false);
            setLikeCount(LikeCount - 1);
            return;
        }

        await axios.post(`${api_uri}/api/post/like`, {
            token: localStorage.getItem("access_token"),
            post_id: post!.post_id,
            remove_like: false,
        });
        setLiked(true);
        setLikeCount(LikeCount + 1);
    };

    const RepostInteraction = async () => {
        if (isReposted) {
            await axios.post(`${api_uri}/api/post/repost`, {
                token: localStorage.getItem("access_token"),
                post_id: post!.post_id,
                remove_repost: true,
            });
            setReposted(false);
            setRepostCount(RepostCount - 1);

            return;
        }

        const res = await axios.post(`${api_uri}/api/post/repost`, {
            token: localStorage.getItem("access_token"),
            post_id: post!.post_id,
            remove_repost: false,
        });

        setReposted(true);
        setRepostCount(RepostCount + 1);
    };

    const BookmarkInteraction = async () => {
        if (isBookmarked) {
            await axios.post(`${api_uri}/api/post/bookmark`, {
                token: localStorage.getItem("access_token"),
                post_id: post!.post_id,
                remove_bookmark: true,
            });
            setBookmarked(false);
            return;
        }

        const res = await axios.post(`${api_uri}/api/post/bookmark`, {
            token: localStorage.getItem("access_token"),
            post_id: post!.post_id,
            remove_bookmark: false,
        });

        setBookmarked(true);
    };

    const EditInteraction = async () => {
        setEditing(!isEditing);
    };

    const SaveEditChanges = async () => {
        setEditing(false);
        const res = await axios.post(`${api_uri}/api/post/edit`, {
            token: localStorage.getItem("access_token"),
            post_id: post!.post_id,
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
            post_id: post!.post_id,
        });

        if (res.data.error) {
            alert(res.data.error);
        } else {
            alert(res.data.message);
            setReplies((old: Array<Post>) => {
                old.splice(
                    old.findIndex(x => x.post_id == post!.post_id),
                    1
                );
                return [...old];
            });
        }
    };

    const OnReplySend = (data: Post) => {
        setReplies(old => [data, ...old]);
    };

    return (
        <div className="page-sides side-middle home-middle">
            <div className="post-page-container">
                <div style={{ backgroundImage: `url(${post_user?.avatar})` }} className="post-page-pfp"></div>
                <p className="post-page-username">
                    {post_user?.username}{" "}
                    <BadgesToJSX badges={post_user ? post_user.badges : []} className="profile-badge" />
                </p>
                <p className="post-page-handle">
                    @{post_user?.handle} -{" "}
                    <span style={{ color: "white" }}>
                        {" "}
                        {moment(new Date(parseInt(post ? post.creation_date.$date.$numberLong : "0")))
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
                    <p>{finalContent}</p>
                )}
                <div className="post-interaction-btn">
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

                    {self_user?.handle == post?.handle && !post?.repost ? (
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
            </div>
            <Divider />
            <PostTyper replying_to={post ? post.post_id : ""} onSend={OnReplySend} />
            <Divider />
            {self_user
                ? replies.map((post: Post) => {
                      return (
                          <PostBox
                              delete_post_on_bookmark_remove={true}
                              setPosts={setReplies}
                              self_user={self_user}
                              key={post.post_id}
                              post={post}
                          />
                      );
                  })
                : ""}
        </div>
    );
}

export default MiddleSide;