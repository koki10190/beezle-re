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
import { toast } from "react-toastify";
import { PostReaction, ReactionsData } from "../../types/ReactionsData";
import TrimToDots from "../../functions/TrimToDots";
import { AVATAR_SHAPES } from "../../types/cosmetics/AvatarShapes";
import ShadeColor from "../../functions/ShadeColor";
import GetAuthToken from "../../functions/GetAuthHeader";
import GetFullAuth from "../../functions/GetFullAuth";
import CStatus from "../../functions/StatusToClass";

interface ReactionsInter {
    [key: string]: PostReaction[];
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
    const [bgGradient, setBgGradient] = useState("linear-gradient(#000000, #000000)");

    const [isLikeHovered, setLikeHovered] = useState(false);
    const [isRepostHovered, setRepostHovered] = useState(false);

    const [isEditing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [finalContent, setFinalContent] = useState("");
    const [isPostEdited, setPostEdited] = useState(false);
    const [replyingToPost, setReplyingToPost] = useState<Post>();
    const [reactions, setReactions] = useState<ReactionStruct>({
        reactions: {},
    });
    const [reactionOpened, setReactionOpened] = useState(false);

    const ReactionInteraction = () => {
        setReactionOpened(!reactionOpened);
    };

    useEffect(() => {
        (async () => {
            const priv = (await fetchUserPrivate()) as UserPrivate;

            console.log("foreach");
            const replies_res = await axios.get(`${api_uri}/api/post/get/replies?post_id=${post_id}`, GetFullAuth());
            let post_res = await axios.get(`${api_uri}/api/post/get/one?post_id=${post_id}`, GetFullAuth());

            if (post_res.data.error) {
                window.location.href = "/not-found";
            }

            if (post_res.data.repost) {
                setIsRepost(post_res.data.repost);
                post_res = await axios.get(`${api_uri}/api/post/get/one?post_id=${post_res.data.post_op_id}`, GetFullAuth());
            }

            setReplies(replies_res.data.replies);
            setSelfUser(priv);
            setPost(post_res.data);
            setPostUser((await fetchUserPublic(post_res.data.repost ? post_res.data.post_op_handle : post_res.data.handle)) as UserPublic);

            setLiked((post_res.data as Post).likes.find((s) => s === priv.handle) ? true : false);
            setReposted((post_res.data as Post).reposts.find((s) => s === priv.handle) ? true : false);
            setBookmarked(priv.bookmarks.find((s) => s === (post_res.data as Post).post_id) ? true : false);
            setPinned(priv.pinned_post === post_res.data.post_id);
            setLikeCount((post_res.data as Post).likes.length);
            setRepostCount((post_res.data as Post).reposts.length);

            setEditContent(post_res.data.content);
            setFinalContent(post_res.data.content);
            setPostEdited(post_res.data.edited);

            setPost((old) => {
                setReactions({
                    reactions: (old.reactions as ReactionsInter) ? (old.reactions as ReactionsInter) : {},
                });
                return old;
            });

            if (post_res.data.is_reply) {
                setReplyingToPost((await axios.get(`${api_uri}/api/post/get/one?post_id=${post_res.data.replying_to}`, GetFullAuth())).data);
            }

            const react_data = (await axios.get(`${api_uri}/api/post/get/reacts?post_id=${post_res.data.post_id}`, GetFullAuth()))
                .data as ReactionsData;

            const local_reactions: ReactionStruct = { reactions: {} };
            react_data.reacts.forEach((reaction) => {
                if (!local_reactions.reactions[reaction.emoji]) local_reactions.reactions[reaction.emoji] = [];

                local_reactions.reactions[reaction.emoji].push(reaction);
            });
            setReactions((old) => {
                return local_reactions;
            });
        })();
    }, []);

    useEffect(() => {
        if (!post_user) return;
        const color1 = ShadeColor(post_user.customization?.profile_gradient ? post_user.customization.profile_gradient.color1 : "#000000", -100);
        const color2 = ShadeColor(post_user.customization?.profile_gradient ? post_user.customization.profile_gradient.color2 : "#000000", -100);

        setBgGradient(`linear-gradient(-45deg, ${color1}, ${color2})`);
    }, [post_user]);

    const LikeInteraction = async () => {
        if (isLiked) {
            const res = await axios.patch(
                `${api_uri}/api/post/like`,
                {
                    post_id: post!.post_id,
                    remove_like: true,
                },
                {
                    headers: GetAuthToken(),
                },
            );
            if (res.data.error) {
                toast.error(res.data.error);
                return;
            }
            setLiked(false);
            setLikeCount(LikeCount - 1);
            return;
        }

        const res = await axios.patch(
            `${api_uri}/api/post/like`,
            {
                post_id: post!.post_id,
                remove_like: false,
            },
            {
                headers: GetAuthToken(),
            },
        );
        if (res.data.error) {
            toast.error(res.data.error);
            return;
        }
        setLiked(true);
        setLikeCount(LikeCount + 1);
    };

    const RepostInteraction = async () => {
        if (isReposted) {
            const res = await axios.post(
                `${api_uri}/api/post/repost`,
                {
                    post_id: post!.post_id,
                    remove_repost: true,
                },
                {
                    headers: GetAuthToken(),
                },
            );
            if (res.data.error) {
                toast.error(res.data.error);
                return;
            }
            setReposted(false);
            setRepostCount(RepostCount - 1);

            return;
        }

        const res = await axios.post(
            `${api_uri}/api/post/repost`,
            {
                post_id: post!.post_id,
                remove_repost: false,
            },
            {
                headers: GetAuthToken(),
            },
        );
        if (res.data.error) {
            toast.error(res.data.error);
            return;
        }

        setReposted(true);
        setRepostCount(RepostCount + 1);
    };

    const PinInteraction = async () => {
        if (isPinned) {
            await axios.post(
                `${api_uri}/api/post/pin`,
                {
                    post_id: post!.post_id,
                    remove_pin: true,
                },
                {
                    headers: GetAuthToken(),
                },
            );
            setPinned(false);
            return;
        }

        const res = await axios.post(
            `${api_uri}/api/post/pin`,
            {
                post_id: post!.post_id,
                remove_pin: false,
            },
            {
                headers: GetAuthToken(),
            },
        );

        setPinned(true);
    };

    const BookmarkInteraction = async () => {
        if (isBookmarked) {
            await axios.post(
                `${api_uri}/api/post/bookmark`,
                {
                    post_id: post!.post_id,
                    remove_bookmark: true,
                },
                {
                    headers: GetAuthToken(),
                },
            );
            setBookmarked(false);
            return;
        }

        const res = await axios.post(
            `${api_uri}/api/post/bookmark`,
            {
                post_id: post!.post_id,
                remove_bookmark: false,
            },
            {
                headers: GetAuthToken(),
            },
        );

        setBookmarked(true);
    };

    const EditInteraction = async () => {
        setEditing(!isEditing);
    };

    const SaveEditChanges = async () => {
        setEditing(false);
        const res = await axios.post(
            `${api_uri}/api/post/edit`,
            {
                post_id: post!.post_id,
                content: editContent,
            },
            {
                headers: GetAuthToken(),
            },
        );

        if (res.data.error) {
            toast.error(res.data.error);
        } else {
            toast.success("Edited post successfully");
            setFinalContent(editContent);
        }

        setPostEdited(true);
    };

    const DeleteInteraction = async () => {
        const res = await axios.post(
            `${api_uri}/api/post/delete`,
            {
                post_id: post!.post_id,
            },
            {
                headers: GetAuthToken(),
            },
        );

        if (res.data.error) {
            toast.error(res.data.error);
        } else {
            toast.success(res.data.message);
            setReplies((old: Array<Post>) => {
                old.splice(
                    old.findIndex((x) => x.post_id == post!.post_id),
                    1,
                );
                return [...old];
            });
        }
    };

    const OnReplySend = (data: Post) => {
        setReplies((old) => [data, ...old]);
    };

    const [canAddReaction, setCanAddReaction] = useState(true);
    const ReactToPost = async (emojiData: EmojiClickData, event: MouseEvent) => {
        if (!canAddReaction) {
            toast.error("Cannot React, You're on cooldown!");
            return;
        }
        // if (emojiData.isCustom) return toast.error("Custom emojis on reactions is not supported!");
        const emoji = emojiData.isCustom ? emojiData.imageUrl : emojiData.emoji;

        const res = await axios.post(
            `${api_uri}/api/post/react`,
            {
                emoji: emoji,
                post_id: post.post_id,
            },
            {
                headers: GetAuthToken(),
            },
        );

        if (res.data.error) {
            toast.error(res.data.error);
        } else {
            setReactions((old) => {
                const new_arr = { ...old };
                const user_already_reacted = new_arr.reactions[emoji]?.findIndex((x) => x.handle == self_user.handle) ?? -1;
                if (user_already_reacted > -1) new_arr.reactions[emoji]?.splice(user_already_reacted, 1);
                else {
                    if (!new_arr.reactions[emoji]) new_arr.reactions[emoji] = [];
                    new_arr.reactions[emoji].push({
                        _id: "",
                        post_id: post.post_id,
                        emoji: emoji,
                        handle: self_user.handle,
                    });
                }
                // if (_.reactions[emoji]) _.reactions[emojiData.emoji] += 1;
                // else _.reactions[emojiData.emoji] = 1;
                return new_arr;
            });
        }
        setCanAddReaction(false);
        setTimeout(() => {
            setCanAddReaction(true);
        }, 3000);
        // textarea.current!.value += emojiData.isCustom ? `<:${emojiData.emoji}:> ` : emojiData.emoji;
    };

    const ReactSpecific = async (emoji: string) => {
        if (!canAddReaction) {
            toast.error("Cannot React, You're on cooldown!");
            return;
        }

        const res = await axios.post(
            `${api_uri}/api/post/react`,
            {
                emoji: emoji,
                post_id: post.post_id,
            },
            {
                headers: GetAuthToken(),
            },
        );

        if (res.data.error) {
            toast.error(res.data.error);
        } else {
            setReactions((old) => {
                const new_arr = { ...old };
                const user_already_reacted = new_arr.reactions[emoji].findIndex((x) => x.handle == self_user.handle) ?? -1;
                if (user_already_reacted > -1) new_arr.reactions[emoji].splice(user_already_reacted, 1);
                else {
                    if (!new_arr.reactions[emoji]) new_arr.reactions[emoji] = [];
                    new_arr.reactions[emoji].push({
                        _id: "",
                        post_id: post.post_id,
                        emoji: emoji,
                        handle: self_user.handle,
                    });
                }
                // if (_.reactions[emojiData.emoji]) _.reactions[emojiData.emoji] += 1;
                // else _.reactions[emojiData.emoji] = 1;
                return new_arr;
            });
        }

        setCanAddReaction(false);
        setTimeout(() => {
            setCanAddReaction(true);
        }, 3000);
        // textarea.current!.value += emojiData.isCustom ? `<:${emojiData.emoji}:> ` : emojiData.emoji;
    };

    return (
        <div style={{ background: bgGradient }} className="page-sides side-middle home-middle">
            <div className="post-page-container">
                {post && post_user ? (
                    <>
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

                        {post.is_reply && replyingToPost ? (
                            <h4
                                onClick={() => (window.location.href = replyingToPost?.content ? `/post/${post.replying_to}` : `/`)}
                                className="post-attr"
                            >
                                <i className="fa-solid fa-comment"></i> Replying to{" "}
                                {replyingToPost?.content ? TrimToDots(replyingToPost.content, 100) : "[REDACTED]"}
                            </h4>
                        ) : (
                            ""
                        )}
                    </>
                ) : (
                    ""
                )}
                <div style={{ cursor: "pointer" }} onClick={() => (window.location.href = `/profile/${post_user?.handle}`)}>
                    <div className="avatar-container">
                        <div
                            style={{
                                backgroundImage: `url(${post_user?.avatar})`,
                                clipPath: AVATAR_SHAPES[post_user?.customization?.square_avatar]
                                    ? AVATAR_SHAPES[post_user?.customization?.square_avatar].style
                                    : "",
                                borderRadius:
                                    AVATAR_SHAPES[post_user?.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                                        ? post_user?.customization?.square_avatar
                                            ? "5px"
                                            : "100%"
                                        : "100%",
                            }}
                            className="post-page-pfp"
                        ></div>
                        <div style={{ bottom: "1px", right: "1px" }} className={`status-indicator ${CStatus(post_user?.status ?? "offline")}`}></div>
                    </div>
                    <p className="post-page-username">
                        {post_user ? <Username user={post_user} /> : ""}{" "}
                        <BadgesToJSX is_bot={post_user?.is_bot} badges={post_user ? post_user.badges : []} className="profile-badge" />
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
                                .replace("ayear", "1 year")}
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
                            onChange={(e) => setEditContent(e.target.value)}
                            className="input-field"
                        ></textarea>
                        <button onClick={SaveEditChanges} style={{ marginTop: "10px" }} className="button-field shadow fixed-100">
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
                        className="content"
                    ></p>
                )}
                <div className="post-interaction-btn">
                    <a style={isReposted ? { color: "rgb(60, 255, 86)" } : {}} onClick={RepostInteraction} className="post-inter post-inter-lime">
                        <i className=" fa-solid fa-repeat"></i>{" "}
                        <FlipNumbers
                            height={15}
                            width={15}
                            color=""
                            play
                            nonNumberClassName="like-flip"
                            numberClassName="like-flip-number"
                            perspective={100}
                            numbers={millify(RepostCount)}
                        />
                    </a>
                    <a
                        onMouseEnter={() => setLikeHovered(true)}
                        onMouseLeave={() => setLikeHovered(false)}
                        onClick={LikeInteraction}
                        style={isLiked ? { color: "rgb(255, 73, 73)" } : {}}
                        className="post-inter post-inter-red"
                    >
                        <i className="fa-solid fa-heart"></i>{" "}
                        <FlipNumbers
                            height={15}
                            width={15}
                            color=""
                            play
                            nonNumberClassName="like-flip"
                            numberClassName="like-flip-number"
                            perspective={100}
                            numbers={millify(LikeCount)}
                        />
                    </a>
                    <a onClick={ReactionInteraction} className="post-inter-orange">
                        <i className="fa-solid fa-face-awesome"></i>{" "}
                    </a>
                    <a onClick={BookmarkInteraction} style={isBookmarked ? { color: "rgb(60, 193, 255)" } : {}} className="post-inter-blue">
                        <i className=" fa-solid fa-bookmark"></i>
                    </a>
                    <a onClick={PinInteraction} style={isPinned ? { color: "rgb(60, 193, 255)" } : {}} className="post-inter-blue">
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
                        customEmojis={self_user?.customization?.emojis ?? []}
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
                        if (reactions.reactions[key].length <= 0) return <></>;
                        return (
                            <p
                                style={
                                    reactions.reactions[key].findIndex((x) => x.handle === self_user?.handle) > -1
                                        ? { border: `solid 2px rgba(255, 255, 255, 0.6)` }
                                        : {}
                                }
                                onClick={() => ReactSpecific(key)}
                            >
                                {key.startsWith("http") ? (
                                    <div
                                        style={{
                                            backgroundImage: `url(${key})`,
                                        }}
                                        title={"custom_emoji"}
                                        className="emoji"
                                    ></div>
                                ) : (
                                    <span className="reaction-emoji">{key}</span>
                                )}
                                <span className="reaction-count">{reactions.reactions[key].length}</span>
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
                      if (post.repost) return;
                      return (
                          <PostBox delete_post_on_bookmark_remove={true} setPosts={setReplies} self_user={self_user} key={post.post_id} post={post} />
                      );
                  })
                : ""}
        </div>
    );
}

export default MiddleSide;
