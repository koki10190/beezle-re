import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate } from "../../../functions/fetchUserPrivate";
import { UserPrivate } from "../../../types/User";
import { Post } from "../../../types/Post";
import FetchPost from "../../../functions/FetchPost";
import "./Details.css";
import Divider from "../../../Components/Divider";
import { api_uri } from "../../../links";
import axios from "axios";
import { toast } from "react-toastify";
import GetAuthToken from "../../../functions/GetAuthHeader";

interface Props {
    user: UserPrivate;
}

function Details({ user }: Props) {
    const [password, setPassword] = useState("");
    const statePassRef = useRef<HTMLParagraphElement>(null);

    const ChangePassword = async () => {
        const res = await axios.patch(
            `${api_uri}/api/user/change_password`,
            {
                password,
            },
            {
                headers: GetAuthToken(),
            },
        );

        statePassRef.current!.innerText = res.data.error ? res.data.error : res.data.message;

        if (res.data.error) toast.error(res.data.error);
        else toast.success(res.data.message);
        window.location.href = "/logout";
    };

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>Details</h1>
                <Divider />
                <h2 className="settings-details-h2">Handle</h2>
                <h4>@{user.handle}</h4>
                <h2 className="settings-details-h2">Email</h2>
                <h4>{user.email}</h4>
                <Divider />
                <h1>Change Password</h1>
                <input onChange={(e) => setPassword(e.target.value)} className="input-field fixed-100" placeholder="Password" />
                <button onClick={ChangePassword} className="button-field">
                    Change Password
                </button>
                <p ref={statePassRef}></p>
            </div>
        </>
    );
}

export default Details;
