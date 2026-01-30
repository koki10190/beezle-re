import axios from "axios";

import ReactDOMServer from "react-dom/server";
import React, { useEffect, useRef, useState, UIEvent, forwardRef } from "react";
import Divider from "../../../Components/Divider";
import "./DmPageCreateGC.css";
import UploadToImgurVideoByFile from "../../../functions/UploadToImgurVideoByFile";
import { toast } from "react-toastify";
import { api_uri } from "../../../links";
import GetFullAuth from "../../../functions/GetFullAuth";
import { UserPrivate, UserPublic } from "../../../types/User";
import { fetchUserPublic } from "../../../functions/fetchUserPublic";
import { AVATAR_SHAPES, AvatarShape } from "../../../types/cosmetics/AvatarShapes";

function DmEditGCMember({ handle, gc, self_user }: { handle: string; gc: BeezleDM.GroupChat; self_user: UserPrivate }) {
    const [user, setUser] = useState<UserPublic>();

    useEffect(() => {
        (async () => {
            setUser(await fetchUserPublic(handle));
        })();
    }, []);

    const BanMember = async () => {
        toast.info("Removing Member...");
        const res = await axios.patch(
            `${api_uri}/api/dms/gc_remove_member`,
            {
                handle,
                group_id: gc.group_id,
            },
            GetFullAuth(),
        );
        if (res.data.message) toast.success("Member has been removed from the Group Chat, Please refresh.");
    };

    if (!user)
        return (
            <div className="user-list-item">
                <p>Loading...</p>
            </div>
        );

    return (
        <div className="user-list-item">
            <div
                style={{
                    backgroundImage: `url(${user?.avatar})`,
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
                className="avatar"
            ></div>
            <p className="username">
                @{user?.username} {(gc.owner === self_user.handle && gc.owner !== user.handle) || gc.owner === user.handle ? " - " : ""}
            </p>
            <div style={{ marginLeft: "5px" }} className="btn-list">
                {gc.owner === self_user.handle && gc.owner !== user.handle ? (
                    <a onClick={BanMember} className="btn">
                        <i className="fa-solid fa-ban" /> Remove Member
                    </a>
                ) : null}

                {gc.owner === user.handle ? (
                    <span className="crown">
                        <i className="fa-solid fa-crown" />
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export default DmEditGCMember;
