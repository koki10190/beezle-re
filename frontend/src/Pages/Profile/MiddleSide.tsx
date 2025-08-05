import axios from "axios";
import { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import React from "react";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import "./Profile.css";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import { BadgesToJSX } from "../../functions/badgesToJSX";
import RepToParagraph from "../../Components/RepToParagraph";
import { Post } from "../../types/Post";
import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import SetLevelColor from "../../functions/SetLevelColor";
import Username from "../../Components/Username";
import pSBC from "../../functions/ShadeColor";
import ShadeColor from "../../functions/ShadeColor";
import ProgressBar from "@ramonak/react-progress-bar";
import months from "../../types/Month";
import { toast } from "react-toastify";
import parseURLs from "../../functions/parseURLs";
import useMousePos from "../../hooks/useMousePos";
import RepToIcon from "../../Components/RepToIcon";
import MentionHover from "../../Components/MentionHover";
import { AVATAR_SHAPES, AvaterShape } from "../../types/cosmetics/AvatarShapes";
import TrophyShowcase from "./TrophyShowcase";
import { TROPHIES, Trophy } from "../../types/showcase/Trophy";
import GetAuthToken from "../../functions/GetAuthHeader";
import GetFullAuth from "../../functions/GetFullAuth";
import { STEAM_ICON_URL } from "../../types/steam/steam_urls";
import CStatus from "../../functions/StatusToClass";

function Loading() {
    return (
        <div className="page-sides side-middle">
            <div className="profile">
                <div className="pfp"></div>
                <p className="username"></p>
                <p className="handle"></p>
            </div>
        </div>
    );
}

function msToMinutesAndSeconds(millis: number) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + ((seconds as any) < 10 ? "0" : "") + seconds;
}

function Loaded({ user, self }: { user: UserPublic | UserPrivate; self: UserPrivate | null }) {
    const [isFollowing, setFollowing] = useState(user.followers.find((x) => x === self?.handle) ? true : false);
    const [followingCount, setFollowingCount] = useState(user.following.length);
    const [followersCount, setFollowersCount] = useState(user.followers.length);
    const [followsYou, setFollowsYou] = useState(self.followers.find((x) => x === user.handle) ? true : false);
    const [pinnedPost, setPinnedPost] = useState<Post | null>(null);
    const [spotifyData, setSpotifyData] = useState<Spotify.CurrentlyPlayingResponse>();
    const [lastfmData, setLastfmData] = useState<lastfm.NowPlaying | null>(null);
    const [lastfmUserData, setLastfmUserData] = useState<{ user: lastfm.User } | null>(null);
    const [joinDate, setJoinDate] = useState<string>();
    const [steam_user_data, setSteamUserData] = useState<Steam.PlayerSummary>();
    const [mention_hover, setMentionHover] = useState<UserPublic | null>(null);
    const [hasNotif, setHasNotif] = useState(false);
    const [notif_can_enable, setCanEnableNotifs] = useState(true);
    const [notifCooldown, setNotifCooldown] = useState(setTimeout(() => {}, 0));
    const [blocked, setBlocked] = useState(false);
    const [blockBtn, setBlockedBtn] = useState(false);
    const mousePos = useMousePos();

    const OnMentionHovered = async (mention: string) => {
        const data = await fetchUserPublic(mention.replace("@", ""));
        setMentionHover(data);
    };

    const GetAllMentions = () => {
        const matches = user.about_me.match(/@([a-z\d_\.-]+)/gi);

        matches?.forEach(async (mention) => {
            const element = document.getElementById("mention-hover-" + mention.replace("@", "") + "-" + user.handle) as HTMLAnchorElement;
            console.log(element, "mention-hover-" + mention.replace("@", "") + "-" + user.handle);

            if (!element) {
                element.onmouseover = () => {
                    OnMentionHovered(element.innerText);
                };
                element.onmouseleave = () => {
                    setMentionHover(null);
                };
            }
        });
    };

    const [bgGradient, setBgGradient] = useState(
        `linear-gradient(-45deg, ${ShadeColor(
            user.customization?.profile_gradient ? user.customization.profile_gradient.color1 : "rgb(231, 129, 98)",
            -75,
        )}, ${ShadeColor(user.customization?.profile_gradient ? user.customization.profile_gradient.color2 : "rgb(231, 129, 98)", -75)})`,
    );
    const [gradient, setGradient] = useState(
        `linear-gradient(45deg, ${ShadeColor(
            user.customization?.profile_gradient ? user.customization.profile_gradient.color1 : "rgb(231, 129, 98)",
            -25,
        )}, ${ShadeColor(user.customization?.profile_gradient ? user.customization.profile_gradient.color2 : "rgb(231, 129, 98)", -25)})`,
    );
    const levelBox = useRef<HTMLSpanElement>(null);
    const [steamData, setSteamData] = useState<any>();
    const [steamInventory, setSteamInventory] = useState<Steam.InventoryJSON>();

    const FollowInteraction = async () => {
        const res = await axios.post(
            `${api_uri}/api/user/follow`,
            {
                handle: user.handle,
                follow: !isFollowing,
            },
            {
                headers: GetAuthToken(),
            },
        );

        setFollowersCount(!isFollowing ? followersCount + 1 : followersCount - 1);
        setFollowing(!isFollowing);
    };

    const [allPosts, setAllPosts] = useState<Array<Post>>([]);
    const [posts, setPosts] = useState<Array<Post>>([]);
    const [postOffset, setPostOffset] = useState(0);

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target! as HTMLDivElement;
        if (!(element.scrollHeight - element.scrollTop === element.clientHeight)) return;

        // detected bottom

        const _posts = (await axios.get(`${api_uri}/api/post/get/profile?handle=${user.handle}&offset=${postOffset}`, GetFullAuth())).data;
        setPosts((old) => [...old, ..._posts.posts]);
        setPostOffset(_posts.offset);
        setBlocked(_posts.blocked ?? false);

        // setPosts(old => [...old, ...allPosts.splice(postOffset, postOffset + 5)]);
    };

    const FetchSpotifyData = async () => {
        try {
            if (!user.connections?.spotify?.access_token) return;

            const res = await axios.get(`${api_uri}/api/connections/spotify/status?handle=${user.handle}`, { headers: GetAuthToken() });
            const data = res.data;

            if (data.error) {
                await axios.patch(`${api_uri}/api/connections/spotify/refresh_token?handle=${user.handle}`);
                return;
            }

            setSpotifyData(data);
        } catch (e) {}
    };

    const FetchLastfmData = async () => {
        try {
            if (!user.connections?.lastfm?.username) return;

            const res = await axios.get(`${api_uri}/api/lastfm/now_playing?username=${user.connections.lastfm.username}`, GetFullAuth());
            const data = res.data;

            setLastfmData(data.error ? null : data);

            const res_user = await axios.get(`${api_uri}/api/lastfm/get_user?username=${user.connections.lastfm.username}`, GetFullAuth());

            setLastfmUserData(res_user.data?.error ? null : res_user.data);
        } catch (e) {}
    };

    const BlockUser = async () => {
        setBlockedBtn((old) => !old);
        const res = await axios.post(
            `${api_uri}/api/user/block`,
            {
                handle: user.handle,
                block: !blockBtn,
            },
            {
                headers: GetAuthToken(),
            },
        );

        toast.success(res.data.message as string);

        return;
    };

    const SetNotificationForSelf = async () => {
        if (!notif_can_enable) {
            toast.error("You're on cooldown! Please wait a bit.");
            return;
        }
        clearTimeout(notifCooldown);
        setNotifCooldown(
            setTimeout(() => {
                setCanEnableNotifs(true);
            }, 2000),
        );
        const res = await axios.post(
            `${api_uri}/api/user/add_notif`,
            {
                handle: user.handle,
                add: !hasNotif,
            },
            {
                headers: GetAuthToken(),
            },
        );
        setHasNotif((old) => !old);
        setCanEnableNotifs(false);
    };

    useEffect(() => {
        GetAllMentions();

        (async () => {
            const isBlocked = await axios.get(`${api_uri}/api/user/is_blocked`, {
                params: {
                    by: self.handle,
                    who: user.handle,
                },
                headers: GetAuthToken(),
            });

            setBlockedBtn(isBlocked.data?.is_blocked ?? false);

            const date = new Date(parseInt(user.creation_date.$date.$numberLong));
            setJoinDate(`${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`);

            const posts = (await axios.get(`${api_uri}/api/post/get/profile?handle=${user.handle}&offset=${postOffset}`, GetFullAuth())).data;
            setPosts(posts.posts);
            setPostOffset(posts.offset);
            setBlocked(posts.blocked ?? false);

            if (user.handle !== self.handle) {
                const hasNotif = await axios.post(
                    `${api_uri}/api/user/check_has_notif`,
                    {
                        handle: user.handle,
                    },
                    {
                        headers: GetAuthToken(),
                    },
                );

                setHasNotif(hasNotif.data.has);
                if (hasNotif.data.error) console.error(hasNotif.data.error);
            }

            if (user.pinned_post !== "") {
                let post = (await axios.get(`${api_uri}/api/post/get/one?post_id=${user.pinned_post}`, GetFullAuth())).data;
                setPinnedPost(post.error ? null : post);
            }

            try {
                if (user.connections?.steam?.id) {
                    const steam_res = await axios.get(
                        `${api_uri}/api/connections/steam_get_game?steam_id=${user.connections.steam.id}`,
                        GetFullAuth(),
                    );
                    const steam_data = steam_res.data;
                    if (steam_data) setSteamData(steam_data[Object.keys(steam_data)[0]].data);

                    // const steam_inventory_res = await axios.get(`${api_uri}/api/connections/steam_get_inventory`, {
                    //     params: {
                    //         steam_id: user.connections.steam.id,
                    //         app_id: 730,
                    //     },
                    //     headers: GetAuthToken(),
                    // });

                    // setSteamInventory(steam_inventory_res.data);

                    const steam_ps_res = await axios.get(`${api_uri}/api/connections/steam_get?steam_id=${user.connections.steam.id}`, GetFullAuth());
                    console.log(steam_ps_res.data);
                    if (steam_ps_res.data) setSteamUserData(steam_ps_res.data as Steam.PlayerSummary);
                }
            } catch (e) {
                console.error("STEAM ERROR CAUGHT:", e);
            }

            FetchLastfmData();
            FetchSpotifyData();
            setInterval(() => {
                FetchSpotifyData();
                FetchLastfmData();
            }, 4000);
        })();
    }, []);

    useEffect(() => {
        SetLevelColor(user, levelBox.current!);
    }, [levelBox]);

    return (
        <>
            {mention_hover ? <MentionHover user={mention_hover} mousePos={mousePos} /> : ""}
            <div
                style={{
                    background: bgGradient,
                }}
                onScroll={handleScroll}
                className="page-sides side-middle"
            >
                {blocked ? (
                    <div
                        style={{
                            display: "flex",
                            width: "100%",
                            alignItems: "center",
                            textAlign: "center",
                            justifyContent: "center",
                        }}
                    >
                        <h1>You're blocked by this user.</h1>
                    </div>
                ) : (
                    ""
                )}
                <div style={{ display: blocked ? "none" : "block" }} className="profile">
                    <div
                        style={{
                            backgroundImage: `url(${user.banner})`,
                        }}
                        className="banner"
                    ></div>
                    <div className="avatar-container">
                        <div
                            style={{
                                backgroundImage: `url(${user.avatar})`,
                                clipPath: AVATAR_SHAPES[user?.customization?.square_avatar]
                                    ? AVATAR_SHAPES[user?.customization?.square_avatar].style
                                    : "",
                                borderRadius:
                                    AVATAR_SHAPES[user?.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                                        ? user?.customization?.square_avatar
                                            ? "5px"
                                            : "100%"
                                        : "100%",
                            }}
                            className="pfp"
                        ></div>
                        <div
                            className={`status-indicator-profile ${
                                user.handle == self.handle ? CStatus(user?.status_db ?? "offline") : CStatus(user?.status ?? "offline")
                            }`}
                        ></div>
                    </div>
                    <p className="username">
                        <Username user={user} /> <BadgesToJSX is_bot={user?.is_bot} badges={user.badges} className="profile-badge" />
                    </p>
                    <p className="handle">@{user.handle} </p>
                    <p style={{ color: "white", marginTop: "-20px", fontSize: "20px" }} className="handle">
                        <span
                            className="test-gradient"
                            // style={{
                            // 	background: "-webkit-linear-gradient(45deg, #fc0b03, #0398fc)",
                            // 	WebkitBackgroundClip: "text",
                            // 	WebkitTextFillColor: "transparent",
                            // }}
                        >
                            Level{" "}
                            <span ref={levelBox} className="level-box">
                                <span>
                                    {user.levels
                                        ? user.levels.level
                                            ? user.levels.level.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                            : 0
                                        : (0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </span>
                            <span style={{ color: "rgba(255,255,255,0.6)" }}>
                                {" - XP "}{" "}
                                {user.levels
                                    ? user.levels.xp
                                        ? user.levels.xp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                        : 0
                                    : (0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                /1,000
                            </span>
                        </span>
                    </p>
                    <div className="inline-stats">
                        <p>
                            <i style={{ color: "rgb(255, 208, 108)" }} className="fa-solid fa-coins"></i> {user.coins.toLocaleString("en-US")}
                        </p>
                        <RepToParagraph reputation={user.reputation} />
                        {followsYou ? <p className="follows-you">Follows you</p> : ""}
                    </div>

                    {user.handle === self?.handle ? (
                        <button
                            style={{ background: gradient }}
                            onClick={() => (window.location.href = "/edit/profile")}
                            className="button-field profile-edit-button"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <button style={{ background: gradient }} onClick={FollowInteraction} className="button-field profile-edit-button">
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    )}
                    {user.handle !== self?.handle ? (
                        hasNotif ? (
                            <button
                                onClick={SetNotificationForSelf}
                                style={{ width: "50px", marginTop: "50px" }}
                                className="button-field button-field-red profile-edit-button"
                            >
                                <i className="fa-solid fa-bell-on" />
                            </button>
                        ) : (
                            <button
                                onClick={SetNotificationForSelf}
                                style={{ marginTop: "50px" }}
                                className="button-field button-field-blurple profile-edit-button"
                            >
                                <i className="fa-solid fa-bell-plus" />
                            </button>
                        )
                    ) : (
                        ""
                    )}
                    {user.handle !== self?.handle ? (
                        !blockBtn ? (
                            <button onClick={BlockUser} className="button-field button-field-red profile-edit-button profile-block-button">
                                <i className="fa-solid fa-ban"></i> Block
                            </button>
                        ) : (
                            <button onClick={BlockUser} className="button-field button-field-green profile-edit-button profile-block-button">
                                <i className="fa-solid fa-ban"></i> Unblock
                            </button>
                        )
                    ) : (
                        ""
                    )}
                    {user.about_me !== "" ? (
                        <div
                            style={{
                                background: gradient,
                            }}
                            className="profile-container"
                        >
                            <p className="profile-container-header">About Me</p>
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: parseURLs(user.about_me, user, false, user.handle),
                                }}
                                className="about_me"
                            ></p>
                        </div>
                    ) : (
                        <></>
                    )}
                    <div
                        style={{
                            background: gradient,
                        }}
                        className="profile-container"
                    >
                        <p className="profile-container-header">Joined At</p>
                        <p className="about_me">{joinDate}</p>
                    </div>
                    {user.activity.replace(/ /g, "") != "" ? (
                        <div
                            style={{
                                background: gradient,
                            }}
                            className="profile-container"
                        >
                            <p className="profile-container-header">Activity</p>
                            <p className="about_me">{user.activity}</p>
                        </div>
                    ) : (
                        ""
                    )}
                    {Object.keys(user.connections).length > 0 ? (
                        <div
                            style={{
                                background: gradient,
                            }}
                            className="profile-container"
                        >
                            <p className="profile-container-header">
                                <i className="fa-solid fa-link"></i> Connections
                            </p>
                            <div className="profile-connections">
                                {user.connections.discord ? (
                                    <a
                                        className="remove-textdecor button-field button-field-blurple   "
                                        onClick={() => {
                                            navigator.clipboard.writeText(user.connections.discord.data.username).then(
                                                () => {
                                                    toast.success("Copied to clipboard!");
                                                },
                                                (err) => {
                                                    toast.error("Couldn't copy to clipboard: " + err);
                                                },
                                            );
                                        }}
                                    >
                                        <i className="fa-brands fa-discord"></i> Discord:{" "}
                                        <div
                                            style={{
                                                backgroundImage: `url(https://cdn.discordapp.com/avatars/${user.connections.discord.data.discord_id}/${user.connections.discord.data.avatar}.webp?size=128&animated=true)`,
                                                verticalAlign: "middle",
                                                width: "20px",
                                                height: "20px",
                                            }}
                                            className="connections-pfp"
                                        ></div>{" "}
                                        @{user.connections.discord.data.username}
                                    </a>
                                ) : (
                                    ""
                                )}
                                {user.connections.steam ? (
                                    <a
                                        className="remove-textdecor button-field button-field-blue"
                                        href={`https://steamcommunity.com/profiles/${user.connections.steam.id}`}
                                        target="_blank"
                                    >
                                        <i className="fa-brands fa-steam"></i> Steam:{" "}
                                        <div
                                            style={{
                                                backgroundImage: `url(${steam_user_data?.avatar ?? "0"})`,
                                                verticalAlign: "middle",
                                                width: "20px",
                                                height: "20px",
                                            }}
                                            className="connections-pfp"
                                        ></div>{" "}
                                        {steam_user_data?.personaname ?? ""}
                                    </a>
                                ) : (
                                    ""
                                )}
                                {user.connections.lastfm ? (
                                    <a
                                        className="remove-textdecor button-field button-field-red"
                                        href={`https://last.fm/user/${user.connections.lastfm.username}`}
                                        target="_blank"
                                    >
                                        <i className="fa-brands fa-lastfm"></i> last.fm:{" "}
                                        <div
                                            style={{
                                                backgroundImage: `url(${lastfmUserData?.user.image[0]["#text"] ?? ""})`,
                                                verticalAlign: "middle",
                                                width: "20px",
                                                height: "20px",
                                            }}
                                            className="connections-pfp"
                                        ></div>{" "}
                                        {user.connections.lastfm.username}
                                    </a>
                                ) : (
                                    ""
                                )}
                                {user.connections.spotify ? (
                                    <a
                                        className="remove-textdecor button-field button-field-green"
                                        href={`${user.connections.spotify.external_urls.spotify}`}
                                        target="_blank"
                                    >
                                        <i className="fa-brands fa-spotify"></i> Spotify:{" "}
                                        <div
                                            style={{
                                                backgroundImage: `url(${user.connections.spotify.images[0].url})`,
                                                verticalAlign: "middle",
                                                width: "20px",
                                                height: "20px",
                                            }}
                                            className="connections-pfp"
                                        ></div>{" "}
                                        {user.connections.spotify.display_name}
                                    </a>
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}
                    {user.milestones?.length > 0 ? (
                        <div
                            style={{
                                background: gradient,
                            }}
                            className="profile-container"
                        >
                            <p className="profile-container-header">
                                <i className="fa-solid fa-trophy-star" /> Milestones
                            </p>
                            {user.milestones.map((milestone, index) => {
                                return (
                                    <div className="about_me">
                                        <TrophyShowcase type={TROPHIES[milestone]} user={user} />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        ""
                    )}
                    {steamInventory ? (
                        <div
                            style={{
                                background: gradient,
                            }}
                            className="profile-container"
                        >
                            <p className="profile-container-header">
                                <i className="fa-brands fa-steam" /> Steam Inventory
                            </p>

                            <div
                                style={{ "--cols": Math.ceil(steamInventory.descriptions.length / 5) } as React.CSSProperties}
                                className="steam-inventory-container"
                            >
                                {steamInventory.descriptions.map((item: Steam.RGDecsription) => {
                                    return (
                                        <div
                                            title={item.name}
                                            onClick={() => window.open(item.actions[0].link, "_blank")}
                                            className="steam-inventory-box"
                                        >
                                            <div
                                                className="steam-inventory-image"
                                                style={{
                                                    border: `solid 2px #${item.name_color ?? "FFFFFF"}`,
                                                    backgroundImage: `url(${STEAM_ICON_URL}${item.icon_url})`,
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <br />
                        </div>
                    ) : (
                        ""
                    )}
                    {steamData ? (
                        <div
                            style={{
                                background: gradient,
                                cursor: "pointer",
                            }}
                            className="profile-container steam-container"
                            onClick={() => window.open(`https://store.steampowered.com/app/${steamData.steam_appid}`)}
                        >
                            <p style={{ marginBottom: "5px" }} className="profile-container-header">
                                <i className="fa-brands fa-steam" /> Playing Game
                            </p>
                            <div className="about_me">
                                <div className="steam-game-container">
                                    <div className="steam-game-header" style={{ backgroundImage: `url(${steamData.header_image})` }}></div>
                                    <div className="steam-game-name">
                                        <p>{steamData.name}</p>
                                        <p className="steam-game-author">By {steamData.developers.join(",")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    {spotifyData && spotifyData?.is_playing ? (
                        <div
                            style={{
                                background: gradient,
                                cursor: "pointer",
                            }}
                            className="profile-container steam-container"
                            onClick={() => window.open(`${spotifyData.item.external_urls.spotify}`)}
                        >
                            <p style={{ marginBottom: "5px" }} className="profile-container-header">
                                <i className="fa-brands fa-spotify" /> Listening To Music
                            </p>
                            <div className="about_me">
                                <div className="steam-game-container">
                                    <div
                                        className="spotify-game-header"
                                        style={{
                                            backgroundImage: `url(\"${
                                                (spotifyData.item as Spotify.TrackObjectFull).album.images[0]?.url ??
                                                "https://i.imgur.com/xSPEBeI.png"
                                            }\")`,
                                        }}
                                    ></div>
                                    <div className="spotify-game-name">
                                        <p>{spotifyData.item.name}</p>
                                        <p className="steam-game-author">
                                            By{" "}
                                            {(spotifyData.item as Spotify.TrackObjectFull).artists.map((artist, i) => {
                                                if (i === (spotifyData.item as Spotify.TrackObjectFull).artists.length - 1) {
                                                    return artist.name.replace(/(.{16})..+/, "$1…");
                                                } else {
                                                    return artist.name.replace(/(.{16})..+/, "$1…") + ", ";
                                                }
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <ProgressBar
                                    completed={spotifyData.progress_ms}
                                    maxCompleted={spotifyData.item.duration_ms}
                                    customLabel={msToMinutesAndSeconds(spotifyData.progress_ms)}
                                    className="spotify-progress-bar"
                                    barContainerClassName="spotify-pb-bar"
                                    bgColor={bgGradient}
                                    height="15px"
                                    customLabelStyles={{
                                        color: "white",
                                        marginBottom: "-4px",
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    {lastfmData && user.connections?.lastfm?.username && user.connections?.lastfm?.show_scrobbling ? (
                        <div
                            style={{
                                background: gradient,
                                cursor: "pointer",
                            }}
                            className="profile-container steam-container"
                            onClick={() => window.open(`${lastfmData.url}`)}
                        >
                            <p style={{ marginBottom: "5px" }} className="profile-container-header">
                                <i className="fa-brands fa-lastfm" /> Scrobbling Now
                            </p>
                            <div className="about_me">
                                <div className="steam-game-container">
                                    <div
                                        className="spotify-game-header"
                                        style={{
                                            backgroundImage: `url(\"${lastfmData.image.large}\")`,
                                        }}
                                    ></div>
                                    <div className="spotify-game-name">
                                        <p>{lastfmData.name}</p>
                                        <p className="steam-game-author">By {lastfmData.artist.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    <div className="followers-and-following">
                        <a href={`/following/${user.handle}`}>
                            Following <span>{followingCount}</span>
                        </a>
                        <a href={`/followers/${user.handle}`}>
                            Followers <span>{followersCount}</span>
                        </a>
                    </div>
                    <div style={{ marginBottom: "30px" }}></div>
                    {/* <Divider /> */}
                    {pinnedPost ? (
                        <PostBox
                            override_gradient={
                                user.customization.profile_gradient_bought && user.customization.profile_gradient
                                    ? { gradient1: user.customization.profile_gradient.color1, gradient2: user.customization.profile_gradient.color2 }
                                    : null
                            }
                            setPosts={setPosts}
                            self_user={self as UserPrivate}
                            key={pinnedPost.post_id}
                            post={pinnedPost}
                            pinned={true}
                        />
                    ) : (
                        ""
                    )}
                    {posts.map((post: Post) => {
                        return (
                            <PostBox
                                allow_reply_attribute={true}
                                override_gradient={
                                    user.customization.profile_gradient_bought && user.customization.profile_gradient
                                        ? {
                                              gradient1: user.customization.profile_gradient.color1,
                                              gradient2: user.customization.profile_gradient.color2,
                                          }
                                        : null
                                }
                                setPosts={setPosts}
                                self_user={self as UserPrivate}
                                key={post.post_id}
                                post={post}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
}

function MiddleSide({ handle }: { handle: string }) {
    const [user, setUser] = useState<UserPublic | UserPrivate | null>(null);
    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);

    useEffect(() => {
        (async () => {
            if (localStorage.getItem("access_token")) {
                setSelfUser(await fetchUserPrivate());
            }
            const fetch_user = await fetchUserPublic(handle);
            setUser(fetch_user);

            if (!fetch_user) window.location.href = "/not-found";
        })();
    }, []);

    return <>{user ? <Loaded user={user} self={self_user} /> : <Loading />}</>;
}

export default MiddleSide;
