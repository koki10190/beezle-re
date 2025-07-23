import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import { discord, github, twitter, youtube } from "../links";
import react from "react";

import "../Main.css";
import "./LoginPage.css";
import { TypeAnimation } from "react-type-animation";
import CheckServerStatus from "../functions/CheckServerStatus";
import { toast } from "react-toastify";

function Home() {
    const [isRegister, setRegister] = useState(false);

    useEffect(() => {
        (async () => {
            const status = await CheckServerStatus();
            if (localStorage.getItem("access_token") && status) {
                window.location.href = "/home";
            }

            if (!status)
                toast.error("Servers are down! Please come back later.", {
                    icon: <i style={{ color: "#ff5050" }} className="fa-solid fa-heart-crack"></i>,
                });
        })();
    }, []);

    return (
        <>
            <header className="login-page-header">
                <h1 className="login-page-title">
                    Welcome to <span className="login-page-title-color">Beezle</span>
                    <span className="login-page-title-re">:RE</span>
                </h1>
                <div className="homepage-links login-page-links">
                    <button onClick={() => window.open(github, "_blank")?.focus()} className="button-field button-field-grayblack">
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
                <TypeAnimation
                    sequence={[
                        // Same substring at the start will only be typed out once, initially
                        "An Open-Source social media platform without any bullshit.",
                        1000, // wait 1s before replacing "Mice" with "Hamsters"
                        "Free customisation, without payment.",
                        1000,
                        "We hate pedophiles, including lolis and cubs.",
                        1000,
                        "Gain XP, Levels, and coins by just using the website!",
                        1000,
                    ]}
                    wrapper="span"
                    speed={50}
                    className="login-page-typing-animation"
                    repeat={Infinity}
                />
                <div className="login-page-inputs">
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
            </header>
            {/* <div className="home-boxes">
                <div className="home-box homebox2">
                    <div>
                        {isRegister ? (
                            <RegisterForm setRegister={setRegister} isRegister={isRegister} />
                        ) : (
                            <LoginForm setRegister={setRegister} isRegister={isRegister} />
                        )}
                        <p>
                            Once you login/register you're agreeing with our{' '}
                            <a className="link" target="_blank" href="/privacy-and-terms">
                                Privacy Policy & Terms of Service
                            </a>
                        </p>
                    </div>
                </div>
            </div> */}
        </>
    );
}

export default Home;
