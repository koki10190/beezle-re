import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams, useSearchParams } from "react-router-dom";
import { api_uri, discord, github, twitter, youtube } from "../links";
import react from "react";

import "../Verify/Verify.css";
import GetAuthToken from "../functions/GetAuthHeader";

function Steam() {
    const { auth_id } = useParams();
    const [msg, setMsg] = useState("");
    const [searchParams] = useSearchParams();

    useEffect(() => {
        (async () => {
            console.log(searchParams);
            let steam_id = searchParams.get("openid.claimed_id");
            steam_id = steam_id.split("/id/")[1];

            setMsg(
                (
                    await axios.post(
                        `${api_uri}/api/connections/steam`,
                        {
                            steam_id,
                        },
                        {
                            headers: GetAuthToken(),
                        },
                    )
                ).data,
            );
        })();
    }, []);

    return (
        <>
            <div className="centered">
                {" "}
                <h1>{msg}</h1>
            </div>
        </>
    );
}

export default Steam;
