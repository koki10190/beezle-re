import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate, GetUserPrivate } from "../../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../../types/User";
import { Post } from "../../../types/Post";
import { FetchPost } from "../../../functions/FetchPost";
import Divider from "../../../Components/Divider";
import { api_uri } from "../../../links";
import axios from "axios";
import { ReportType } from "../../../types/Report";
import { fetchUserPublic } from "../../../functions/fetchUserPublic";
import { toast } from "react-toastify";
import GetAuthToken from "../../../functions/GetAuthHeader";
interface Props {
    user: UserPrivate;
}

function BanUser({ user }: Props) {
    const [toBan, setToBan] = useState("");
    const [reason, setReason] = useState("");

    const _BanUser = async () => {
        const res = await axios.post(
            `${api_uri}/api/user/ban`,
            {
                handle: toBan,
                reason: reason.replace(/ /g, "") == "" ? "No reason provided" : reason,
            },
            {
                headers: GetAuthToken(),
            },
        );

        if (res.data.error) toast.error(res.data.error);
        else toast.success(res.data.message);
        setToBan("");
        setReason("");
    };

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>
                    <i className="fa-solid fa-hammer-crash" /> Ban User
                </h1>
                <Divider />
                <input value={toBan} onChange={(e: any) => setToBan(e.target.value)} className="input-field fixed-100" placeholder="User Handle" />
                <input value={reason} onChange={(e: any) => setReason(e.target.value)} className="input-field fixed-100" placeholder="Ban Reason" />
                <button onClick={_BanUser} className="button-field button-field-red">
                    Ban User
                </button>
            </div>
        </>
    );
}

export default BanUser;
