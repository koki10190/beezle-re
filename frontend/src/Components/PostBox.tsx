import axios from 'axios';
import { FormEvent, LegacyRef, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, redirect } from 'react-router-dom';
import './PostBox.css';
import moment from 'moment';
import { UserPrivate, UserPublic } from '../types/User';
import { Post } from '../types/Post';
import { fetchUserPublic } from '../functions/fetchUserPublic';
import { api_uri } from '../links';
import FlipNumbers from 'react-flip-numbers';
import millify from 'millify';
import { BadgesToJSX } from '../functions/badgesToJSX';
import { socket } from '../ws/socket';
import ReactDOMServer from 'react-dom/server';
import ImageEmbed from './ImageEmbed';
import VideoEmbed from './VideoEmbed';
import sanitize from 'sanitize-html';
import parseURLs from '../functions/parseURLs';
import RepToIcon from './RepToIcon';
import Username from './Username';
import ShadeColor from '../functions/ShadeColor';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import BeezleEmoji from './Emoji';
import { ReactionsData } from '../types/ReactionsData';
import { toast } from 'react-toastify';

interface PostBoxData {
    post: Post;
    self_user: UserPrivate;
    setPosts: any;
    delete_post_on_bookmark_remove?: boolean;
    allow_reply_attribute?: boolean;
    pinned?: boolean;
    override_gradient?: { gradient1: string; gradient2: string };
}

interface ReactionsInter {
    [key: string]: number;
}

interface ReactionStruct {
    reactions: ReactionsInter | null;
}

function PostBox({
    post,
    self_user,
    setPosts,
    override_gradient,
    delete_post_on_bookmark_remove = false,
    allow_reply_attribute = false,
    pinned = false,
}: PostBoxData) {
    const [user, setUser] = useState<UserPublic>();
    const [isLiked, setLiked] = useState(false);
    const [isReposted, setReposted] = useState(false);
    const [isBookmarked, setBookmarked] = useState(false);
    const [LikeCount, setLikeCount] = useState(post.likes.length);
    const [RepostCount, setRepostCount] = useState(post.reposts.length);
    const [ReplyCount, setReplyCount] = useState(0);
    const [reactionOpened, setReactionOpened] = useState(false);

    const [isLikeHovered, setLikeHovered] = useState(false);
    const [isRepostHovered, setRepostHovered] = useState(false);
    const [replyingToPost, setReplyingToPost] = useState<Post>();

    const [bgGradient, setBgGradient] = useState('');
    const [steamData, setSteamData] = useState<any | null>(null);

    const [reactions, setReactions] = useState<ReactionStruct>({
        reactions: {},
    });

    const [canAddReaction, setCanAddReaction] = useState(true);
    const ReactToPost = async (emojiData: EmojiClickData, event: MouseEvent) => {
        if (!canAddReaction) return;
        if (emojiData.isCustom) return toast.error('Custom emojis on reactions is not supported!');
        const res = await axios.post(`${api_uri}/api/post/react`, {
            token: localStorage.getItem('access_token'),
            emoji: emojiData.emoji,
            post_id: post.post_id,
        });

        if (res.data.error) {
            toast.error(res.data.error);
        } else {
            setReactions((old) => {
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

        const res = await axios.post(`${api_uri}/api/post/react`, {
            token: localStorage.getItem('access_token'),
            emoji: emoji,
            post_id: post.post_id,
        });

        if (res.data.error) {
            toast.error(res.data.error);
        } else {
            setReactions((old) => {
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

    useEffect(() => {
        (async () => {
            let user: UserPublic = {} as any;
            if (post.repost) {
                post = (await axios.get(`${api_uri}/api/post/get/one?post_id=${post.post_op_id}`)).data;
                user = (await fetchUserPublic(post.handle)) as UserPublic;
                setUser(user);
                setLikeCount(post.likes.length);
                setRepostCount(post.reposts.length);
            } else {
                user = (await fetchUserPublic(post.handle)) as UserPublic;
                setUser(user);
            }

            if (override_gradient) {
                const color1 = ShadeColor(override_gradient.gradient1, -25);
                const color2 = ShadeColor(override_gradient.gradient2, -25);

                setBgGradient(`linear-gradient(-45deg, ${color1}, ${color2})`);
            } else {
                const color1 = ShadeColor(
                    user.customization?.profile_gradient ? user.customization.profile_gradient.color1 : 'rgb(231, 129, 98)',
                    -25,
                );
                const color2 = ShadeColor(
                    user.customization?.profile_gradient ? user.customization.profile_gradient.color2 : 'rgb(231, 129, 98)',
                    -25,
                );

                setBgGradient(`linear-gradient(-45deg, ${color1}, ${color2})`);
            }

            setLiked(post.likes.find((s) => s === self_user.handle) ? true : false);
            setReposted(post.reposts.find((s) => s === self_user.handle) ? true : false);
            setBookmarked(self_user.bookmarks.find((s) => s === post.post_id) ? true : false);
            setReplyCount((await axios.get(`${api_uri}/api/post/get/reply_count?post_id=${post.post_id}`)).data.count as number);
            if (post.is_reply) {
                setReplyingToPost((await axios.get(`${api_uri}/api/post/get/one?post_id=${post.replying_to}`)).data);
            }

            const steam_res = await axios.get(`${api_uri}/api/connections/steam_get_game?steam_id=${user.connections?.steam?.id}`);
            const steam_data = steam_res.data;
            if (steam_data) setSteamData(steam_data[Object.keys(steam_data)[0]].data);

            // Set Reactions
            const react_data = (await axios.get(`${api_uri}/api/post/get/reacts?post_id=${post.post_id}`)).data as ReactionsData;
            console.log('React Data:', react_data);

            const local_reactions: ReactionStruct = { reactions: {} };
            react_data.reacts.forEach((reaction) => {
                if (!local_reactions.reactions[reaction.emoji]) local_reactions.reactions[reaction.emoji] = 0;

                local_reactions.reactions[reaction.emoji]++;
            });
            setReactions((old) => {
                return local_reactions;
            });
        })();
    }, []);

    useEffect(() => {
        console.log('Post', post.content, 'Handle', post.handle);
    }, [user]);

    const ReplyInteraction = async () => {
        window.location.href = `/post/${post.post_id}`;
    };

    const LikeInteraction = async () => {
        if (isLiked) {
            await axios.post(`${api_uri}/api/post/like`, {
                token: localStorage.getItem('access_token'),
                post_id: post.repost ? post.post_op_id : post.post_id,
                remove_like: true,
            });
            setLiked(false);
            setLikeCount(LikeCount - 1);
            return;
        }

        console.log('CHANNEL: notification');
        socket.send('notification', {
            handle: self_user.handle,
            post,
            message: 'liked your post!',
        });

        await axios.post(`${api_uri}/api/post/like`, {
            token: localStorage.getItem('access_token'),
            post_id: post.repost ? post.post_op_id : post.post_id,
            remove_like: false,
        });
        setLiked(true);
        setLikeCount(LikeCount + 1);
    };

    const RepostInteraction = async () => {
        if (isReposted) {
            console.log(post.post_id);
            await axios.post(`${api_uri}/api/post/repost`, {
                token: localStorage.getItem('access_token'),
                post_id: post.repost ? post.post_op_id : post.post_id,
                remove_repost: true,
            });
            setReposted(false);
            setRepostCount(RepostCount - 1);

            return;
        }

        const res = await axios.post(`${api_uri}/api/post/repost`, {
            token: localStorage.getItem('access_token'),
            post_id: post.repost ? post.post_op_id : post.post_id,
            remove_repost: false,
        });

        setReposted(true);
        setRepostCount(RepostCount + 1);
    };

    const BookmarkInteraction = async () => {
        if (isBookmarked) {
            await axios.post(`${api_uri}/api/post/bookmark`, {
                token: localStorage.getItem('access_token'),
                post_id: post.repost ? post.post_op_id : post.post_id,
                remove_bookmark: true,
            });
            setBookmarked(false);

            if (setPosts && delete_post_on_bookmark_remove) {
                setPosts((old: Array<Post>) => {
                    old.splice(
                        old.findIndex((x) => x.post_id == (post.repost ? post.post_op_id : post.post_id)),
                        1,
                    );
                    return [...old];
                });
            }

            return;
        }

        const res = await axios.post(`${api_uri}/api/post/bookmark`, {
            token: localStorage.getItem('access_token'),
            post_id: post.repost ? post.post_op_id : post.post_id,
            remove_bookmark: false,
        });

        setBookmarked(true);
    };

    const ReactionInteraction = () => {
        setReactionOpened(!reactionOpened);
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
            token: localStorage.getItem('access_token'),
            post_id: post.post_id,
            content: editContent,
        });

        if (res.data.error) {
            toast.error(res.data.error);
        } else {
            toast.success('Post Edited');
            setFinalContent(editContent);
        }

        setPostEdited(true);
    };

    const DeleteInteraction = async () => {
        const res = await axios.post(`${api_uri}/api/post/delete`, {
            token: localStorage.getItem('access_token'),
            post_id: post.post_id,
        });

        if (res.data.error) {
            toast.error(res.data.error);
        } else {
            toast.success(res.data.error);
            if (setPosts) {
                setPosts((old: Array<Post>) => {
                    old.splice(
                        old.findIndex((x) => x.post_id == post.post_id),
                        1,
                    );
                    return [...old];
                });
            }
        }
    };

    return (
        <div
            style={{
                background: bgGradient,
            }}
            className="post-box"
        >
            {post.repost ? (
                <h4 onClick={() => (window.location.href = `/profile/${post.handle}`)} className="post-attr">
                    <i className="fa-solid fa-repeat"></i> Repost by @{post.handle}
                </h4>
            ) : (
                ''
            )}
            {isPostEdited ? (
                <h4 className="post-attr">
                    <i className="fa-solid fa-pencil"></i> Edited
                </h4>
            ) : (
                ''
            )}
            {pinned ? (
                <h4 className="post-attr">
                    <i className="fa-solid fa-thumbtack"></i> Pinned
                </h4>
            ) : (
                ''
            )}
            {allow_reply_attribute && post.is_reply ? (
                <h4 onClick={() => (window.location.href = `/post/${post.replying_to}`)} className="post-attr">
                    <i className="fa-solid fa-comment"></i> Replying to {replyingToPost?.content.replace(/(.{12})..+/, '$1…')}
                </h4>
            ) : (
                ''
            )}
            <div
                style={{
                    backgroundImage: `url(${user ? user.avatar : ''})`,
                    borderRadius: user?.customization?.square_avatar ? '5px' : '100%',
                }}
                className="pfp-post"
            ></div>
            <div onClick={() => (window.location.href = `/profile/${user ? user.handle : ''}`)} className="user-detail">
                <p className="username-post">
                    {user ? <Username user={user} /> : ''}{' '}
                    <BadgesToJSX badges={user ? user.badges : []} className="profile-badge profile-badge-shadow" />
                </p>
                <p className="handle-post">
                    @{user ? user.handle : ''}
                    {user ? (
                        <>
                            {' '}
                            <RepToIcon reputation={user.reputation} />
                        </>
                    ) : (
                        ''
                    )}{' '}
                    {user?.activity.replace(/ /g, '') !== '' && user ? (
                        <span style={{ color: 'white' }}>- {sanitize(user.activity.replace(/(.{35})..+/, '$1…'), { allowedTags: [] })}</span>
                    ) : user && steamData ? (
                        <span style={{ color: 'white' }}>
                            - <i className="fa-brands fa-steam" /> Playing {steamData.name}
                        </span>
                    ) : (
                        ''
                    )}
                </p>
                <p className="post-date">
                    {user
                        ? moment(new Date(parseInt(post.creation_date.$date.$numberLong)))
                              .fromNow(true)
                              .replace('minutes', 'm')
                              .replace(' ', '')
                              .replace('hours', 'h')
                              .replace('afew seconds', '1s')
                              .replace('aminute', '1m')
                              .replace('ahour', '1h')
                              .replace('anhour', '1h')
                              .replace('aday', '1d')
                              .replace('days', 'd')
                              .replace('day', '1d')
                              .replace('months', ' months')
                              .replace('ayear', '1 year')
                        : '0'}
                </p>
            </div>
            {isEditing ? (
                <>
                    <textarea
                        placeholder="Edit Post"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="input-field"
                    ></textarea>
                    <button onClick={SaveEditChanges} style={{ marginTop: '10px' }} className="button-field shadow fixed-100">
                        Save Changes
                    </button>
                </>
            ) : (
                <p
                    style={{
                        whiteSpace: 'pre-line',
                    }}
                    dangerouslySetInnerHTML={{
                        __html: parseURLs(finalContent, user),
                    }}
                    className="content"
                ></p>
            )}
            {user ? (
                <div className="post-interaction-btn">
                    <a onClick={ReplyInteraction} className="post-inter-blue">
                        <i className=" fa-solid fa-comment"></i>{' '}
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
                    <a style={isReposted ? { color: 'rgb(60, 255, 86)' } : {}} onClick={RepostInteraction} className="post-inter-lime">
                        <i className=" fa-solid fa-repeat"></i>{' '}
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
                        style={isLiked ? { color: 'rgb(225, 54, 54)' } : {}}
                        className="post-inter-red"
                    >
                        <i className=" fa-solid fa-heart"></i>{' '}
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
                        <i className="fa-solid fa-face-awesome"></i>{' '}
                    </a>
                    <a onClick={BookmarkInteraction} style={isBookmarked ? { color: 'rgb(60, 193, 255)' } : {}} className="post-inter-blue">
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
                        ''
                    )}
                </div>
            ) : (
                ''
            )}
            {reactionOpened ? (
                <EmojiPicker
                    onEmojiClick={ReactToPost}
                    theme={Theme.DARK}
                    emojiStyle={EmojiStyle.NATIVE}
                    reactionsDefaultOpen={true}
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        border: 'none',
                    }}
                />
            ) : (
                ''
            )}
            <div className="reactions">
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
    );
}

export default PostBox;
