import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { api_uri } from "../links";

interface Params {
    setRegister: (a: boolean) => void;
    isRegister: boolean;
}

function LoginForm({ setRegister, isRegister }: Params) {
    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const error = useRef<HTMLParagraphElement>(null);

    const setError = (err: string) => {
        error.current!.innerText = err;
        error.current!.style.color = "red";
    };

    const setSuccess = (err: string) => {
        error.current!.innerText = err;
        error.current!.style.color = "lime";
    };

    const Login = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const s_email = email.current!.value;
        const s_password = password.current!.value;
        if (s_email === "" || s_password === "") return;

        // prettier-ignore
        axios.post(`${api_uri}/api/login_user`, {
            email: email.current!.value,
            password: password.current!.value,
        })
		.then(res => {
			const data = res.data as any;
            if (data.error) {
                setError(data.error);
            } else {
                setSuccess("Logging in...");
                localStorage.setItem("access_token", data.token);
                window.location.replace("/home");
            }
        });
    };

    return (
        <div>
            <form onSubmit={Login}>
                <p style={{ fontSize: "10px", color: "transparent", marginTop: "70px" }}>Login</p>
                <input className="input-field" ref={email} name="email" placeholder="Email or Handle"></input>
                <input
                    className="input-field"
                    ref={password}
                    type="password"
                    name="password"
                    placeholder="Password"
                ></input>
                <div style={{ marginBottom: "10px" }}></div>
                <button type="submit" className="button-field">
                    Login
                </button>
                <p ref={error}></p>
                <a className="instead-anchor" onClick={() => setRegister(!isRegister)}>
                    {isRegister ? "Login Instead" : "Register Instead"}
                </a>
            </form>
        </div>
    );
}

export default LoginForm;
