import axios from "axios";
import { FormEvent, LegacyRef, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect, useNavigate } from "react-router-dom";
import moment from "moment";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import { api_uri } from "../../links";
import FlipNumbers from "react-flip-numbers";
import millify from "millify";
import { BadgesToJSX } from "../../functions/badgesToJSX";
import ReactDOMServer from "react-dom/server";
import sanitize from "sanitize-html";
import parseURLs from "../../functions/parseURLs";
import ShadeColor from "../../functions/ShadeColor";
import { AVATAR_SHAPES, AvatarShape } from "../../types/cosmetics/AvatarShapes";
import GetAuthToken from "../../functions/GetAuthHeader";
import CStatus from "../../functions/StatusToClass";
import RepToIcon from "../../Components/RepToIcon";
import Username from "../../Components/Username";

interface DmUserBoxData {
    dm_option: BeezleDM.DmOption;
    self_user: UserPrivate;
    onClick: any;
    setSelection: any;
}

function DmUserBox({ dm_option, self_user, onClick, setSelection }: DmUserBoxData) {
    const [isFollowing, setFollowing] = useState(false);
    const [bgGradient, setBgGradient] = useState("");
    const [normalGradient, setNormalGradient] = useState("");
    const [user, setUser] = useState<UserPublic>(null);
    const navigate = useNavigate();

    const DeleteSelection = async () => {
        setSelection((old: Array<BeezleDM.DmOption>) => {
            const _new = [...old];
            _new.splice(
                _new.findIndex((x) => x.selection_id === dm_option.selection_id),
                1,
            );
            return _new;
        });

        const res = await axios.delete(`${api_uri}/api/dms/delete_selection`, {
            params: {
                selection_id: dm_option.selection_id,
            },
            headers: GetAuthToken(),
        });
    };

    useEffect(() => {
        (async () => {
            if (dm_option.user_handle) {
                let user = await fetchUserPublic(dm_option.user_handle);
                setUser(user);
                setBgGradient(
                    `linear-gradient(-45deg, ${ShadeColor(
                        user?.customization?.profile_gradient ? user?.customization.profile_gradient.color1 : "rgb(231, 129, 98)",
                        -50,
                    )}, ${ShadeColor(
                        user?.customization?.profile_gradient ? user?.customization.profile_gradient.color2 : "rgb(231, 129, 98)",
                        -50,
                    )})`,
                );
                setNormalGradient(
                    `linear-gradient(-45deg, ${ShadeColor(
                        user?.customization?.profile_gradient ? user?.customization.profile_gradient.color1 : "rgb(231, 129, 98)",
                        0,
                    )}, ${ShadeColor(user?.customization?.profile_gradient ? user?.customization.profile_gradient.color2 : "rgb(231, 129, 98)", 0)})`,
                );
                setFollowing(user?.followers.find((x) => x === self_user.handle) ? true : false);
            }
        })();
    }, []);

    if (!user) {
        return <></>;
    }

    return (
        <div
            style={{
                background: bgGradient,
                height: "auto",
                marginBottom: "",
            }}
            className="post-box user-box"
        >
            <div onClick={onClick} className="user-detail">
                <a onClick={DeleteSelection} className="dmuserbox-delete">
                    <i className="fa-solid fa-x"></i>
                </a>
                <div className="avatar-container">
                    <div
                        style={{
                            backgroundImage: `url(${user ? user.avatar : ""})`,
                            clipPath: AVATAR_SHAPES[user?.customization?.square_avatar]
                                ? AVATAR_SHAPES[user?.customization?.square_avatar].style
                                : AVATAR_SHAPES[AvatarShape.CircleAvatarShape].style,
                            borderRadius:
                                AVATAR_SHAPES[user?.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                                    ? user?.customization?.square_avatar
                                        ? "5px"
                                        : "100%"
                                    : "100%",
                        }}
                        className="pfp-post"
                    ></div>
                    <div
                        className={`status-indicator ${
                            user?.handle == self_user.handle ? CStatus(user?.status_db ?? "offline") : CStatus(user?.status ?? "offline")
                        }`}
                    ></div>
                </div>
                <p className="username-post">
                    {user ? <Username user={user} /> : ""}{" "}
                    <BadgesToJSX is_bot={user?.is_bot} badges={user ? user.badges : []} className="profile-badge profile-badge-shadow" />
                </p>
                <p className="handle-post">
                    @{user ? user.handle : ""}
                    {user ? (
                        <>
                            {" "}
                            <RepToIcon reputation={user.reputation} />
                        </>
                    ) : (
                        ""
                    )}{" "}
                </p>
                <p
                    style={{
                        whiteSpace: "pre-line",
                        margin: "0",
                        marginTop: "20px",
                    }}
                >
                    {user?.activity.replace(/ /g, "") !== "" && user ? (
                        <span style={{ color: "white" }}> {sanitize(user?.activity?.replace(/(.{35})..+/, "$1…"), { allowedTags: [] })}</span>
                    ) : (
                        ""
                    )}
                </p>
            </div>
        </div>
    );
}

export default DmUserBox;
