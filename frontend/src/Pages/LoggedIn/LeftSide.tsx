import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri, discord, github, twitter, youtube } from "../../links";
import { checkToken } from "../../functions/checkToken";

function LeftSide() {
    checkToken();

    return (
        <div className="page-sides side-left">
            <h1>
                Beezle
                <span style={{ fontSize: "35px" }} className="re-text">
                    :RE
                </span>
            </h1>
            <h2 style={{ marginTop: "-20px", color: "rgba(255,255,255,0.2)" }}>Alpha v0.0</h2>
            <div className="left-side-media">
                <button
                    onClick={() => window.open(github, "_blank")?.focus()}
                    className="button-field button-field-grayblack"
                >
                    <i className="fa-brands fa-github-alt"></i>
                </button>
                <button
                    style={{ width: "65px" }}
                    onClick={() => window.open(discord, "_blank")?.focus()}
                    className="button-field button-field-blurple"
                >
                    <i className="fa-brands fa-discord"></i>
                </button>
                <button
                    style={{ width: "57px" }}
                    onClick={() => window.open(twitter, "_blank")?.focus()}
                    className="button-field button-field-blue"
                >
                    <i className="fa-brands fa-twitter"></i>
                </button>
                <button
                    style={{ width: "60px" }}
                    onClick={() => window.open(youtube, "_blank")?.focus()}
                    className="button-field button-field-red"
                >
                    <i className="fa-brands fa-youtube"></i>
                </button>
            </div>
        </div>
    );
}

export default LeftSide;
