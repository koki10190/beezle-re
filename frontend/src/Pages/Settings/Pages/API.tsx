import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate } from "../../../functions/fetchUserPrivate";
import { UserPrivate } from "../../../types/User";
import { Post } from "../../../types/Post";
import FetchPost from "../../../functions/FetchPost";
import "./Details.css";
import Divider from "../../../Components/Divider";
import { api_uri } from "../../../links";
import axios from "axios";

interface Props {
    user: UserPrivate;
}

function API({ user }: Props) {
    const [show, setShow] = useState(false);
    const statePassRef = useRef<HTMLParagraphElement>(null);

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>Token</h1>
                <Divider />
                <button className="button-field" onClick={() => setShow(!show)}>
                    {show ? "Hide Token" : "Show Token"}
                </button>
                {show ? <h4>{localStorage.getItem("access_token")}</h4> : ""}
            </div>
        </>
    );
}

export default API;
