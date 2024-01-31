import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";

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
                </div>
            </div>
        </>
    );
}

export default Home;
