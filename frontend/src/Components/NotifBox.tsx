import { useEffect, useState } from "react";
import { NotificationData, NotifType } from "../types/Notification";
import "./NotifBox.css";
import { UserPublic } from "../types/User";
import { fetchUserPublic } from "../functions/fetchUserPublic";
import { Post } from "../types/Post";
import axios from "axios";
import { api_uri } from "../links";
import Divider from "./Divider";
import sanitize from "sanitize-html";
import RepToIcon from "./RepToIcon";
import parseURLs from "../functions/parseURLs";
import { AVATAR_SHAPES, AvaterShape } from "../types/cosmetics/AvatarShapes";
import { TROPHIES } from "../types/showcase/Trophy";
import GetFullAuth from "../functions/GetFullAuth";
import { FetchPost } from "../functions/FetchPost";

function NotifPost({ post_data }: { post_data: Post }) {
    const [user, setUser] = useState<UserPublic>();

    useEffect(() => {
        (async () => {
            const us = await fetchUserPublic(post_data.handle);
            setUser((us as any).error ? null : us);
        })();
    }, []);

    if (!user) return <></>;

    return (
        <>
            <div style={{ width: "100%", height: "1px", marginTop: "-5px" }}></div>
            <Divider />
            <div className="notif-post-box">
                <div
                    style={{
                        backgroundImage: `url(${user.avatar})`,
                        clipPath: AVATAR_SHAPES[user?.customization?.square_avatar]
                            ? AVATAR_SHAPES[user?.customization?.square_avatar].style
                            : AVATAR_SHAPES[AvaterShape.CircleAvatarShape].style,
                        borderRadius:
                            AVATAR_SHAPES[user?.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                                ? user?.customization?.square_avatar
                                    ? "5px"
                                    : "100%"
                                : "100%",
                    }}
                    className="pfp"
                ></div>
                <div className="user-detail">
                    <p className="username">{user.username}</p>
                    <p className="handle">
                        @{user ? user.handle : ""}
                        {user ? (
                            <>
                                {" "}
                                <RepToIcon reputation={user.reputation} />
                            </>
                        ) : (
                            ""
                        )}{" "}
                        {user?.activity?.trim() !== "" ? (
                            <span style={{ color: "white" }}>- {sanitize(user?.activity?.replace(/(.{35})..+/, "$1…"), { allowedTags: [] })}</span>
                        ) : (
                            ""
                        )}
                    </p>
                </div>
                <p
                    style={{
                        whiteSpace: "pre-line",
                    }}
                    dangerouslySetInnerHTML={{
                        __html: parseURLs(post_data.content, user),
                    }}
                    className="post-content"
                ></p>
            </div>
        </>
    );
}

function NotifBox({ notif }: { notif: NotificationData }) {
    const [user, setUser] = useState<UserPublic | null>();
    const [isPost, setIsPost] = useState(false);
    const [post_data, setPostData] = useState<Post>();

    useEffect(() => {
        (async () => {
            setUser(await fetchUserPublic(notif.caller));

            if (notif.post_id) {
                try {
                    setPostData(await FetchPost(notif.post_id));
                } catch (e) {
                    console.log("Post was not found with id", notif.post_id);
                }
            }
        })();
    }, []);

    const RenderNotifType = () => {
        switch (notif.notif_type ?? NotifType.None) {
            case NotifType.Milestone: {
                const milestone = TROPHIES[notif.milestone];
                return (
                    <p className="notif-message">
                        <i style={{ color: milestone.color }} className={milestone.icon} /> Congratulations! You've achieved{" "}
                        <b style={{ color: milestone.color }}>{milestone.name}</b> milestone!
                    </p>
                );
            }
            default:
                return <></>;
        }

        return <></>;
    };

    return (
        <div
            onClick={() => {
                if ((notif as any).post_id) {
                    window.location.href = `/post/${notif.post_id}`;
                    setIsPost(true);
                }
                if ((notif as any).handle) {
                    window.location.href = `/profile/${(notif as any).handle}`;
                }
            }}
            className="notif"
        >
            {user ? (
                <>
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
                        className="notif-pfp"
                    ></div>
                    <p className="notif-message align">
                        <span
                            onClick={(e: any) => {
                                e.stopPropagation();
                                window.location.href = `/profile/${user.handle}`;
                            }}
                            className="notif-handle"
                        >
                            @{notif.caller}
                        </span>{" "}
                        <span className="notif-content">{notif.message}</span>
                    </p>
                    {post_data ? <NotifPost post_data={post_data} /> : ""}
                </>
            ) : (
                ""
            )}

            <RenderNotifType />
        </div>
    );
}

export default NotifBox;
