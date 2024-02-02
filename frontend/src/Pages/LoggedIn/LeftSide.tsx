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
            <div>
                <button
                    onClick={() => window.open(github, "_blank")?.focus()}
                    style={{ display: "inline-block", marginRight: "15px" }}
                    className="button-field button-field-fixed button-field-grayblack"
                >
                    <i style={{ display: "inline-block", marginRight: "15px" }} className="fa-brands fa-github-alt"></i>
                </button>
                <button
                    onClick={() => window.open(discord, "_blank")?.focus()}
                    style={{ display: "inline-block", marginRight: "15px" }}
                    className="button-field button-field-fixed button-field-blurple"
                >
                    <i style={{ display: "inline-block", marginRight: "15px" }} className="fa-brands fa-discord"></i>
                </button>
                <button
                    onClick={() => window.open(twitter, "_blank")?.focus()}
                    style={{ display: "inline-block", marginRight: "15px" }}
                    className="button-field button-field-fixed button-field-blue"
                >
                    <i style={{ display: "inline-block", marginRight: "15px" }} className="fa-brands fa-twitter"></i>
                </button>
                <button
                    onClick={() => window.open(youtube, "_blank")?.focus()}
                    style={{ display: "inline-block", marginRight: "15px" }}
                    className="button-field button-field-fixed button-field-red"
                >
                    <i style={{ display: "inline-block", marginRight: "15px" }} className="fa-brands fa-youtube"></i>
                </button>
            </div>
        </div>
    );
}

export default LeftSide;
