import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import { api_uri, discord, github, twitter, youtube } from "../links";
import react from "react";

import "./Verify.css";

function SpotifyAuth() {
    const { code } = useParams();

    https: useEffect(() => {
        (async () => {
            alert(code);
        })();
    }, []);

    return (
        <>
            <div className="centered">
                <h1>
                    <i className="fa-brands fa-spotify" />
                    Spotify Authentication
                </h1>
            </div>
        </>
    );
}

export default SpotifyAuth;
