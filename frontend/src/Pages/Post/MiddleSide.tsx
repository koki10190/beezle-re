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
import "../../Components/PostBox.css";
import moment from "moment";
import { BadgesToJSX } from "../../functions/badgesToJSX";
import FlipNumbers from "react-flip-numbers";
import millify from "millify";
import PostTyper from "../../Components/PostTyper";
import parseURLs from "../../functions/parseURLs";
import { Helmet } from "react-helmet";
import Username from "../../Components/Username";
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react";

interface ReactionsInter {
    [key: string]: number;
}

interface ReactionStruct {
    reactions: ReactionsInter | null;
}

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
    const [isPinned, setPinned] = useState(false);
    const [LikeCount, setLikeCount] = useState(0);
    const [RepostCount, setRepostCount] = useState(0);

    const [isLikeHovered, setLikeHovered] = useState(false);
    const [isRepostHovered, setRepostHovered] = useState(false);

    const [isEditing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [finalContent, setFinalContent] = useState("");
    const [isPostEdited, setPostEdited] = useState(false);
    const [replyingToPost, setReplyingToPost] = useState<Post>();
    const [reactions, setReactions] = useState<ReactionStruct>({
        reactions: (post?.reactions as ReactionsInter) ? (post.reactions as ReactionsInter) : {},
    });
    const [reactionOpened, setReactionOpened] = useState(false);

    const ReactionInteraction = () => {
        setReactionOpened(!reactionOpened);
    };

    useEffect(() => {
        (async () => {
            const user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(user);

            console.log("foreach");
            const replies_res = await axios.get(`${api_uri}/api/post/get/replies?post_id=${post_id}`);
            let post_res = await axios.get(`${api_uri}/api/post/get/one?post_id=${post_id}`);
            const priv = (await fetchUserPrivate()) as UserPrivate;

            if (post_res.data.repost) {
                setIsRepost(post_res.data.repost);
                post_res = await axios.get(`${api_uri}/api/post/get/one?post_id=${post_res.data.post_op_id}`);
            }

            setReplies(replies_res.data.replies);
            setSelfUser(priv);
            setPost(post_res.data);
            setPostUser(
                (await fetchUserPublic(
                    post_res.data.repost ? post_res.data.post_op_handle : post_res.data.handle
                )) as UserPublic
            );

            setLiked((post_res.data as Post).likes.find(s => s === priv.handle) ? true : false);
            setReposted((post_res.data as Post).reposts.find(s => s === priv.handle) ? true : false);
            setBookmarked(priv.bookmarks.find(s => s === (post_res.data as Post).post_id) ? true : false);
            setPinned(priv.pinned_post === post_res.data.post_id);
            setLikeCount((post_res.data as Post).likes.length);
            setRepostCount((post_res.data as Post).reposts.length);

            setEditContent(post_res.data.content);
            setFinalContent(post_res.data.content);
            setPostEdited(post_res.data.edited);

            setPost(old => {
                setReactions({
                    reactions: (old.reactions as ReactionsInter) ? (old.reactions as ReactionsInter) : {},
                });
                return old;
            });

            if (post_res.data.is_reply) {
                setReplyingToPost(
                    (await axios.get(`${api_uri}/api/post/get/one?post_id=${post_res.data.replying_to}`)).data
                );
            }
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

    const PinInteraction = async () => {
        if (isPinned) {
            await axios.post(`${api_uri}/api/post/pin`, {
                token: localStorage.getItem("access_token"),
                post_id: post!.post_id,
                remove_pin: true,
            });
            setPinned(false);
            return;
        }

        const res = await axios.post(`${api_uri}/api/post/pin`, {
            token: localStorage.getItem("access_token"),
            post_id: post!.post_id,
            remove_pin: false,
        });

        setPinned(true);
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

    const [canAddReaction, setCanAddReaction] = useState(true);
    const ReactToPost = async (emojiData: EmojiClickData, event: MouseEvent) => {
        if (!canAddReaction) return;
        if (emojiData.isCustom) return alert("Custom emojis on reactions is not supported!");
        const res = await axios.post(`${api_uri}/api/post/react`, {
            token: localStorage.getItem("access_token"),
            emoji: emojiData.emoji,
            post_id: post.post_id,
        });

        if (res.data.error) {
            alert(res.data.error);
        } else {
            setReactions(old => {
                const _ = { ...old };
                if (_.reactions[emojiData.emoji]) _.reactions[emojiData.emoji] += 1;
                else _.reactions[emojiData.emoji] = 1;
                return _;
            });
        }
        setCanAddReaction(false);
        setTimeout(() => {
            setCanAddReaction(true);
        }, 3000);
        // textarea.current!.value += emojiData.isCustom ? `<:${emojiData.emoji}:> ` : emojiData.emoji;
    };

    const ReactSpecific = async (emoji: string) => {
        if (!canAddReaction) return;
        if (emoji.length > 1) return alert("Custom emojis on reactions is not supported!");

        const res = await axios.post(`${api_uri}/api/post/react`, {
            token: localStorage.getItem("access_token"),
            emoji: emoji,
            post_id: post.post_id,
        });

        if (res.data.error) {
            alert(res.data.error);
        } else {
            setReactions(old => {
                const _ = { ...old };
                if (_.reactions[emoji]) _.reactions[emoji] += 1;
                else _.reactions[emoji] = 1;
                return _;
            });
        }

        setCanAddReaction(false);
        setTimeout(() => {
            setCanAddReaction(true);
        }, 3000);
        // textarea.current!.value += emojiData.isCustom ? `<:${emojiData.emoji}:> ` : emojiData.emoji;
    };

    return (
        <div className="page-sides side-middle home-middle">
            <div className="post-page-container">
                {post && post_user ? (
                    <>
                        <Helmet>
                            <title>Beezle: RE - Post</title>
                            <meta name="description" content={`${post.content.replace(/(.{64})..+/, "$1…")}`} />
                            <meta name="keywords" content="react, meta tags, seo" />
                            <meta name="author" content={`@${post.repost ? post.post_op_handle : post.handle}`} />
                            <meta
                                property="og:title"
                                content={`Post by @${post.repost ? post.post_op_handle : post.handle}`}
                            />
                            <meta property="og:description" content={`${post.content.replace(/(.{64})..+/, "$1…")}`} />
                            <meta property="og:image" content={post_user.avatar} />
                            <meta
                                property="og:url"
                                content={`https://beezle.lol/post/${post.repost ? post.post_op_id : post.post_id}`}
                            />
                            <meta
                                name="twitter:title"
                                content={`Post by @${post.repost ? post.post_op_handle : post.handle}`}
                            />
                            <meta name="twitter:description" content={`${post.content.replace(/(.{64})..+/, "$1…")}`} />
                            <meta name="twitter:image" content={`${post_user.avatar}`} />
                            <meta name="twitter:card" content="summary_large_image" />
                        </Helmet>
                        {post.repost ? (
                            <h4
                                onClick={() => (window.location.href = `/profile/${post.handle}`)}
                                className="post-attr"
                            >
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

                        {post.is_reply && replyingToPost ? (
                            <h4
                                onClick={() => (window.location.href = `/post/${post.replying_to}`)}
                                className="post-attr"
                            >
                                <i className="fa-solid fa-comment"></i> Replying to{" "}
                                {replyingToPost?.content.replace(/(.{12})..+/, "$1…")}
                            </h4>
                        ) : (
                            ""
                        )}
                    </>
                ) : (
                    ""
                )}
                <div
                    style={{ cursor: "pointer" }}
                    onClick={() => (window.location.href = `/profile/${post_user?.handle}`)}
                >
                    <div
                        style={{
                            backgroundImage: `url(${post_user?.avatar})`,
                            borderRadius: post_user?.customization?.square_avatar ? "15px" : "100%",
                        }}
                        className="post-page-pfp"
                    ></div>
                    <p className="post-page-username">
                        {post_user ? <Username user={post_user} /> : ""}{" "}
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
                </div>
                {isEditing ? (
                    <>
                        <textarea
                            placeholder="Edit Post"
                            minLength={1}
                            maxLength={300}
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
                        style={{
                            whiteSpace: "pre-line",
                        }}
                        dangerouslySetInnerHTML={{
                            __html: parseURLs(finalContent, post_user),
                        }}
                    ></p>
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
                    <a onClick={ReactionInteraction} className="post-inter-orange">
                        <i className="fa-solid fa-face-awesome"></i>{" "}
                    </a>
                    <a
                        onClick={BookmarkInteraction}
                        style={isBookmarked ? { color: "rgb(60, 193, 255)" } : {}}
                        className="post-inter-blue"
                    >
                        <i className=" fa-solid fa-bookmark"></i>
                    </a>
                    <a
                        onClick={PinInteraction}
                        style={isPinned ? { color: "rgb(60, 193, 255)" } : {}}
                        className="post-inter-blue"
                    >
                        <i className=" fa-solid fa-thumbtack"></i>
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
                {reactionOpened ? (
                    <EmojiPicker
                        onEmojiClick={ReactToPost}
                        theme={Theme.DARK}
                        emojiStyle={EmojiStyle.NATIVE}
                        reactionsDefaultOpen={true}
                        style={{
                            backgroundColor: "rgba(0,0,0,0.7)",
                            border: "none",
                        }}
                    />
                ) : (
                    ""
                )}
                <div className="reactions white-bg">
                    {Object.keys(reactions.reactions).map((key: string, index: number) => {
                        if (index > 12) return <></>;
                        return (
                            <p onClick={() => ReactSpecific(key)}>
                                <span className="reaction-emoji">{key}</span>
                                <span className="reaction-count">{reactions.reactions[key]}</span>
                            </p>
                        );
                    })}
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
