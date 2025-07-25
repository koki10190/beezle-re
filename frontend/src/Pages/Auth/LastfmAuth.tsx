import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import react from "react";
import { api_uri } from "../../links";
import GetAuthToken from "../../functions/GetAuthHeader";

function LastfmAuth() {
    const authMessage = useRef<HTMLSpanElement>();
    const getLastfmTokenFromURL = () => window.location.search.split("=");

    useEffect(() => {
        (async () => {
            const codes_data = getLastfmTokenFromURL();
            const code = codes_data[1];
            console.log(codes_data, code);
            if (codes_data[0] != "?token" || code === "") {
                window.location.href = "/";
                return;
            }
            console.log("success!");

            axios
                .post(
                    `${api_uri}/api/connections/lastfm_auth`,
                    {
                        code,
                    },
                    {
                        headers: GetAuthToken(),
                    },
                )
                .then((res) => {
                    authMessage.current.innerText = "Authenticated!";
                    authMessage.current.setAttribute("style", "color: lime;");
                    setTimeout(() => {
                        window.location.href = "/settings";
                    }, 1000);
                })
                .catch((e) => {
                    console.error(e);
                    authMessage.current.innerText = "Authenticaion Failed!";
                    authMessage.current.setAttribute("style", "color: red;");
                });
        })();
    }, []);

    return (
        <>
            <div className="centered">
                <h1>
                    <i className="fa-brands fa-lastfm" /> <span ref={authMessage}>Authenticating...</span>
                </h1>
            </div>
        </>
    );
}

export default LastfmAuth;
