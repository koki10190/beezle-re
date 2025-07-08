import { useEffect, useState } from "react";
import { UserPrivate, UserPublic } from "../../types/User";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import sanitize from "sanitize-html";
import { redirect, useNavigate } from "react-router-dom";

function DMUser({ user, setDMUser }: { user: UserPublic; setDMUser: any }) {
    const navigate = useNavigate();
    const OnClick = () => {
        navigate("/dms/" + user.handle);
    };

    return (
        <div onClick={OnClick} className="dm-user">
            <div className="dm-user-pfp" style={{ backgroundImage: `url(${user.avatar})` }}></div>
            <p className="dm-user-username">{user.username}</p>
            <p className="dm-user-handle">
                @{user.handle} -{" "}
                <span style={{ color: "white" }}>
                    {sanitize(user.activity.replace(/(.{35})..+/, "$1…"), { allowedTags: [] })}
                </span>
            </p>
            <p>{user.about_me}</p>
        </div>
    );
}

export default DMUser;
