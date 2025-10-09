import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri, discord, github, twitter, youtube } from "../../links";
import { checkToken } from "../../functions/checkToken";
import FollowBox from "../../Components/FollowBox";
import { UserPrivate } from "../../types/User";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import ShadeColor from "../../functions/ShadeColor";
import { RGBToHex } from "../../functions/RGBToHex";

function LeftSide() {
    const [self_user, setSelfUser] = useState<UserPrivate | null>();
    const [grad1, setGrad1] = useState(
        localStorage.getItem("--body-gradient1")
            ? ShadeColor(
                  RGBToHex(
                      parseInt(localStorage.getItem("--body-gradient1").split(",")[0]),
                      parseInt(localStorage.getItem("--body-gradient1").split(",")[1]),
                      parseInt(localStorage.getItem("--body-gradient1").split(",")[2]),
                  ),
                  80,
              )
            : "#ff8800",
    );

    const [grad2, setGrad2] = useState(
        localStorage.getItem("--body-gradient2")
            ? ShadeColor(
                  RGBToHex(
                      parseInt(localStorage.getItem("--body-gradient2").split(",")[0]),
                      parseInt(localStorage.getItem("--body-gradient2").split(",")[1]),
                      parseInt(localStorage.getItem("--body-gradient2").split(",")[2]),
                  ),
                  80,
              )
            : "#ffc56d",
    );

    useEffect(() => {
        (async () => {
            setSelfUser(await fetchUserPrivate());
        })();
    }, []);

    return (
        <div className="page-sides side-left">
            <h1>
                Beezle
                <span
                    style={{
                        fontSize: "35px",
                        background: `-webkit-linear-gradient(45deg, ${grad2}, ${grad1})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                    className="re-text"
                >
                    :RE
                </span>
            </h1>
            <h2
                style={{
                    marginTop: "-20px",
                    color: "rgba(255,255,255,0.2)",
                }}
            >
                Alpha v3.0.0
            </h2>
            <div
                style={{
                    fontFamily: "Open Sans, sans-serif",
                }}
                className="left-side-media"
            >
                <button
                    style={{
                        fontFamily: "Open Sans, sans-serif",
                    }}
                    onClick={() => window.open(github, "_blank")?.focus()}
                    className="button-field button-field-grayblack"
                >
                    <i className="fa-brands fa-github-alt"></i>
                </button>
                <button
                    style={{ fontFamily: "Open Sans, sans-serif" }}
                    onClick={() => window.open(discord, "_blank")?.focus()}
                    className="button-field button-field-blurple"
                >
                    <i className="fa-brands fa-discord"></i>
                </button>
                <button
                    style={{ fontFamily: "Open Sans, sans-serif" }}
                    onClick={() => window.open(twitter, "_blank")?.focus()}
                    className="button-field button-field-blue"
                >
                    <i className="fa-brands fa-twitter"></i>
                </button>
                <button
                    style={{ fontFamily: "Open Sans, sans-serif" }}
                    onClick={() => window.open(youtube, "_blank")?.focus()}
                    className="button-field button-field-red"
                >
                    <i className="fa-brands fa-youtube"></i>
                </button>
            </div>
            <p>
                If you can please consider donating on{" "}
                <a href="https://ko-fi.com/koki1019" target="_blank" className="mention">
                    ko-fi
                </a>{" "}
                to keep beezle hosted 24/7!
            </p>
            <div className="who-to-follow">
                <h2>Who to follow:</h2>
                {self_user ? (
                    <>
                        <FollowBox self_user={self_user} handle="koki" />
                        <FollowBox self_user={self_user} handle="beezle" />
                    </>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}

export default LeftSide;
