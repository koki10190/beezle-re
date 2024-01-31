import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import { discord, github, twitter, youtube } from "../links";

function Home() {
    const [isRegister, setRegister] = useState(false);

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
                            onClick={() => window.open(discord, "_blank")?.focus()}
                            className="button-field button-field-blurple"
                        >
                            <i className="fa-brands fa-discord"></i>
                        </button>
                        <button
                            onClick={() => window.open(twitter, "_blank")?.focus()}
                            className="button-field button-field-blue"
                        >
                            <i className="fa-brands fa-twitter"></i>
                        </button>
                        <button
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
