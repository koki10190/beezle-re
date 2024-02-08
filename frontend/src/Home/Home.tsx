import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import { discord, github, twitter, youtube } from "../links";
import react from "react";

import "../Main.css";

function Home() {
    const [isRegister, setRegister] = useState(false);

    if (localStorage.getItem("access_token")) {
        window.location.href = "/home";
    }

    return (
        <>
            <div className="home-boxes">
                <div className="home-box homebox2">
                    <div>
                        {isRegister ? (
                            <RegisterForm setRegister={setRegister} isRegister={isRegister} />
                        ) : (
                            <LoginForm setRegister={setRegister} isRegister={isRegister} />
                        )}
                        <p>
                            Once you login/register you're agreeing with our{" "}
                            <a className="link" target="_blank" href="/privacy-and-terms">
                                Privacy Policy & Terms of Service
                            </a>
                        </p>
                    </div>
                </div>
                <div className="home-box homebox1">
                    <h1 className="home-box-title">
                        Beezle<span className="home-box-title-re">:RE</span>
                    </h1>
                    <h1 style={{ marginTop: "-50px" }}>An Open Source social media platform.</h1>
                    <div className="homepage-links">
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
            </div>
        </>
    );
}

export default Home;
