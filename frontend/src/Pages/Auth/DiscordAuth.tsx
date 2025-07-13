import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import react from "react";
import { api_uri } from "../../links";

function DiscordAuth() {
    const authMessage = useRef<HTMLSpanElement>();
    const getDiscordCodeFromURL = () => window.location.search.split("=");

    useEffect(() => {
        (async () => {
            const codes_data = getDiscordCodeFromURL();
            const code = codes_data[1];
            console.log(codes_data, code);
            if (codes_data[0] != "?code" || code === "") {
                window.location.href = "/";
                return;
            }
            console.log("success!");

            axios
                .post(`${api_uri}/api/connections/discord_auth`, {
                    code,
                    token: localStorage.getItem("access_token"),
                })
                .then((res) => {
                    authMessage.current.innerText = "Authenticated!";
                    authMessage.current.setAttribute("style", "color: lime;");
                    // setTimeout(() => {
                    //     window.location.href = "/settings";
                    // }, 1000);
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
                    <i className="fa-brands fa-discord" /> <span ref={authMessage}>Authenticating...</span>
                </h1>
            </div>
        </>
    );
}

export default DiscordAuth;
