import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import { api_uri, discord, github, twitter, youtube } from "../links";
import react from "react";

import "./Verify.css";

function VerifyPass() {
    const { auth_id } = useParams();
    const [msg, setMsg] = useState("");

    useEffect(() => {
        (async () => {
            setMsg((await axios.get(`${api_uri}/api/verify_pass?auth_id=${auth_id}`)).data);
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

export default VerifyPass;
