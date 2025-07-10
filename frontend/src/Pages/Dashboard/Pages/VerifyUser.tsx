import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate } from "../../../functions/fetchUserPrivate";
import { BadgeType, UserPrivate, UserPublic } from "../../../types/User";
import { Post } from "../../../types/Post";
import FetchPost from "../../../functions/FetchPost";
import Divider from "../../../Components/Divider";
import { api_uri } from "../../../links";
import axios from "axios";
import { ReportType } from "../../../types/Report";
import { fetchUserPublic } from "../../../functions/fetchUserPublic";
import { toast } from "react-toastify";
interface Props {
    user: UserPrivate;
}

function VerifyUser({ user }: Props) {
    const [handle, setHandle] = useState("");

    const _verify_user_api = async (type: BadgeType) => {
        const res = await axios.post(`${api_uri}/api/user/mod_verify`, {
            token: localStorage.getItem("access_token"),
            handle,
            badge_type: type,
        });

        if (res.data.error) toast.error(res.data.error);
        else toast.success(res.data.message);

        setHandle("");
    };

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>
                    <i className="fa-solid fa-badge-check" /> Verify User
                </h1>
                <p>Moderators! If you verify anyone without owner's permission, you'll be executed by the Queen Bee!</p>
                <Divider />
                <input value={handle} onChange={(e: any) => setHandle(e.target.value)} className="input-field fixed-100" placeholder="User Handle" />
                <button
                    onClick={() => _verify_user_api(BadgeType.VERIFIED)}
                    className="button-field button-field-blue inline-block margin-right-10px"
                >
                    <i className="fa-solid fa-badge-check" /> Give Verify Badge
                </button>
                <button
                    onClick={() => _verify_user_api(BadgeType.OLD_TESTER)}
                    className="button-field button-field-blurple inline-block margin-right-10px"
                >
                    <i className="fa-solid fa-vial-circle-check" /> Give Tester Badge
                </button>
                <button
                    onClick={() => _verify_user_api(BadgeType.CONTRIBUTOR)}
                    className="button-field button-field-pink inline-block margin-right-10px"
                >
                    <i className="fa-solid fa-handshake-angle" /> Give Contrib Badge
                </button>
                <button onClick={() => _verify_user_api(BadgeType.DONATOR)} className="button-field inline-block margin-right-10px">
                    <i className="fa-solid fa-honey-pot" /> Give Donator Badge
                </button>
            </div>
        </>
    );
}

export default VerifyUser;
