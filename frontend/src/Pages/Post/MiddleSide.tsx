import { useEffect, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { FetchPost } from "../../functions/FetchPost";
import { api_uri } from "../../links";
import axios from "axios";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import { useNavigate, useParams } from "react-router-dom";
import "./Post.css";
import "../../Components/PostBox.css";
import moment from "moment";
import { BadgesToJSX } from "../../functions/badgesToJSX";
import FlipNumbers from "react-flip-numbers";
import millify from "millify";
import PostTyper from "../../Components/PostTyper";
import parseURLs, { ExtractBeezlePostFromLinks, ExtractHivesFromLinks } from "../../functions/parseURLs";
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
import RightClickMenu from "../../Components/Menus/RightClickMenu";
import useMousePos from "../../hooks/useMousePos";
import HiveBox from "../Hives/HiveBox";
import Poll from "../../Components/Poll";

interface ReactionsInter {
    [key: string]: PostReaction[];
}

interface ReactionStruct {
    reactions: ReactionsInter | null;
}

function MiddleSide() {
    const { post_id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post>();
    const [replies, setReplies] = useState<Array<Post>>([]);
    const [self_user, setSelfUser] = useState<UserPrivate>();
    const [post_user, setPostUser] = useState<UserPublic>();
    const [isRepost, setIsRepost] = useState(false);
    const [isLiked, setLiked] = useState(false);
    const [isReposted, setReposted] = useState(false);
    const [isBookmarked, setBookmarked] = useState(false);
    const [hive, setHive] = useState<BeezleHives.Hive>();
    const [poll, setPoll] = useState<BeezlePolls.Poll>();
    const [isPinned, setPinned] = useState(false);
    const [LikeCount, setLikeCount] = useState(0);
    const [RepostCount, setRepostCount] = useState(0);
    const [bgGradient, setBgGradient] = useState("linear-gradient(#000000, #000000)");
    const [menuOpened, setMenuOpened] = useState(false);

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
    const [quotePosts, setQuotePosts] = useState<Array<Post>>([]);
    const [quoteHives, setQuoteHives] = useState<Array<BeezleHives.Hive>>([]);
    const SetQuoteHives = async (content) => {
        const hives = await ExtractHivesFromLinks(content);
        console.log(hives);
        setQuoteHives((old) => {
            if (hives.length > 0) return [hives[0]];
            return [];
        });
    };

    const SetQuotePosts = async (content) => {
        const posts = await ExtractBeezlePostFromLinks(content);

        setQuotePosts((old) => {
            if (posts.length > 0) return [posts[0]];
            return [];
        });
    };

    const ReactionInteraction = () => {
        setReactionOpened(!reactionOpened);
    };

    const mousePos = useMousePos();

    useEffect(() => {
        (async () => {
            const priv = (await fetchUserPrivate()) as UserPrivate;

            console.log("foreach");
            const replies_res = await axios.get(`${api_uri}/api/post/get/replies?post_id=${post_id}`, GetFullAuth());
            let post_res = await FetchPost(post_id);

            if (post_res.hive_post) {
                console.log("HIVE", post_res.hive_post);
                axios
                    .get(`${api_uri}/api/hives/get`, {
                        params: {
                            handle: post_res.hive_post,
                        },
                        headers: GetAuthToken(),
                    })
                    .then((res) => {
                        const hive = res.data.hive as BeezleHives.Hive;
                        setHive(hive);
                    });
            }

            if (post_res.poll_id) {
                axios
                    .get(`${api_uri}/api/polls/get`, {
                        params: {
                            poll_id: post_res.poll_id,
                        },
                        headers: GetAuthToken(),
                    })
                    .then((res) => {
                        if (res.data.error) {
                            console.error("POLL FETCH FAILED:", res.data.error);
                            return;
                        }
                        const poll = res.data as BeezlePolls.Poll;
                        console.log("POLL:", poll);
                        setPoll(poll);
                    });
            }

            if (post_res.error) {
                navigate("/not-found");
            }

            if (post_res.repost) {
                setIsRepost(post_res.repost);
                post_res = await FetchPost(post_res.post_op_id);
            }

            setReplies(replies_res.data.replies);
            setSelfUser(priv);
            setPost(post_res);
            setPostUser((await fetchUserPublic(post_res.repost ? post_res.post_op_handle : post_res.handle)) as UserPublic);

            setLiked((post_res as Post).likes.find((s) => s === priv.handle) ? true : false);
            setReposted((post_res as Post).reposts.find((s) => s === priv.handle) ? true : false);
            setBookmarked(priv.bookmarks.find((s) => s === (post_res as Post).post_id) ? true : false);
            setPinned(priv.pinned_post === post_res.post_id);
            setLikeCount((post_res as Post).likes.length);
            setRepostCount((post_res as Post).reposts.length);

            setEditContent(post_res.content);
            setFinalContent(post_res.content);
            setPostEdited(post_res.edited);
            SetQuotePosts(post_res.content);
            SetQuoteHives(post_res.content);

            // setPost((old) => {
            //     setReactions({
            //         reactions: (old.post_reactions as ReactionsInter) ? (old.post_reactions as ReactionsInter) : {},
            //     });
            //     return old;
            // });

            if (post_res.is_reply) {
                setReplyingToPost(await FetchPost(post_res.replying_to));
            }

            const react_data = (await axios.get(`${api_uri}/api/post/get/reacts?post_id=${post_res.post_id}`, GetFullAuth())).data as ReactionsData;

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

        SetQuotePosts(editContent);
        SetQuoteHives(editContent);

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

    if (!post)
        return (
            <div className="page-sides side-middle home-middle">
                <h1>Loading Post...</h1>
            </div>
        );

    return (
        <>
            <Helmet>
                <meta name="theme-color" content={post_user?.customization?.profile_gradient?.color1 ?? "#ff8e3d"} data-react-helmet="true"></meta>
                <title>Beezle: RE | @{post_user?.handle ?? ""}'s Post</title>
            </Helmet>
            <div style={{ background: bgGradient }} className="page-sides side-middle home-middle">
                <div className="post-page-container">
                    {post && post_user ? (
                        <>
                            {post.repost ? (
                                <h4 onClick={() => navigate(`/profile/${post.handle}`)} className="post-attr">
                                    <i className="fa-solid fa-repeat"></i> Repost by @{post.handle}
                                </h4>
                            ) : (
                                ""
                            )}

                            {post.hive_post ? (
                                <h4 onClick={() => navigate(`/hive/${hive?.hive_id}`)} className="post-attr">
                                    <div
                                        style={{
                                            backgroundImage: `url(${hive?.icon})`,
                                        }}
                                        className="post-attrib-hive"
                                    ></div>{" "}
                                    In Hive "{hive?.name ?? "Not Found"}"
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
                                <h4 onClick={() => navigate(replyingToPost?.content ? `/post/${post.replying_to}` : `/`)} className="post-attr">
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
                    <div style={{ cursor: "pointer" }} onClick={() => navigate(`/profile/${post_user?.handle}`)}>
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
                            <div
                                style={{ bottom: "1px", right: "1px" }}
                                className={`status-indicator ${
                                    post_user?.handle == self_user?.handle ? CStatus(post_user?.status_db) : CStatus(post_user?.status ?? "offline")
                                }`}
                            ></div>
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
                                    .replace("amonth", "1 month")
                                    .replace("ahour", "1h")
                                    .replace("anhour", "1h")
                                    .replace("aday", "1d")
                                    .replace("days", "d")
                                    .replace("day", "1d")
                                    .replace("months", " months")
                                    .replace("ayear", "1 year")
                                    .replace("years", "y")}
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
                                __html: parseURLs(finalContent, post_user, true, "", navigate),
                            }}
                            className="content"
                        ></p>
                    )}
                    {quotePosts.length > 0 && self_user ? (
                        quotePosts.map((post) => {
                            return (
                                <PostBox
                                    className="quote-post"
                                    reply_box={true}
                                    box={false}
                                    removeBackground={true}
                                    delete_post_on_bookmark_remove={false}
                                    setPosts={(e) => {}}
                                    self_user={self_user}
                                    key={post.post_id}
                                    post={post}
                                    allow_reply_attribute={false}
                                    reply_chain_counter={0}
                                />
                            );
                        })
                    ) : (
                        <></>
                    )}
                    {quoteHives.length > 0 && self_user ? (
                        quoteHives.map((hive) => {
                            return <HiveBox hive={hive} key={hive.hive_id} />;
                        })
                    ) : (
                        <></>
                    )}
                    {poll && self_user ? <Poll poll={poll} self_user={self_user} /> : ""}
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

                        <a onClick={() => setMenuOpened((old) => !old)} className="post-inter">
                            <i className="fa-solid fa-ellipsis"></i>
                        </a>

                        {menuOpened ? (
                            <RightClickMenu
                                onClickAnywhere={() => setTimeout(() => setMenuOpened(false), 100)}
                                mouse_pos={mousePos}
                                icon={<i className="fa-solid fa-envelope" />}
                                name="Post Interactions"
                            >
                                {self_user.handle === post.handle && !post.repost ? (
                                    <>
                                        <button onClick={EditInteraction} className="rcm-button">
                                            <i className="fa-solid fa-pen-to-square" /> Edit Post
                                        </button>
                                        <button onClick={DeleteInteraction} className="rcm-button post-inter-red">
                                            <i className=" fa-solid fa-trash"></i> Delete Post
                                        </button>
                                    </>
                                ) : (
                                    ""
                                )}
                                <button onClick={PinInteraction} className="rcm-button post-inter-blue">
                                    <i className="fa-solid fa-thumbtack" /> {isPinned ? "Unpin Post" : "Pin Post"}
                                </button>
                                <button onClick={BookmarkInteraction} className="rcm-button post-inter-blue">
                                    <i className="fa-solid fa-bookmark" /> {isBookmarked ? "Unbookmark" : "Bookmark"}
                                </button>
                            </RightClickMenu>
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
                <PostTyper hive_post={post?.hive_post ?? null} replying_to={post ? post.post_id : ""} onSend={OnReplySend} />
                <Divider />
                {self_user
                    ? replies.map((post: Post) => {
                          if (post.repost) return;
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
        </>
    );
}

export default MiddleSide;
