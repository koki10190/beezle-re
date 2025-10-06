import axios, { AxiosError } from "axios";
import React, { Children, FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { api_uri } from "../links";

interface Params {
    setRegister: (a: boolean) => void;
    isRegister: boolean;
    children?: React.ReactNode;
}

function LoginForm({ setRegister, isRegister, children }: Params) {
    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const error = useRef<HTMLParagraphElement>(null);
    const btn = useRef<HTMLButtonElement>(null);
    const [btnText, setBtnText] = useState("Login");

    const [passwordReset, setPasswordReset] = useState(false);

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

        setBtnText("Logging in...");
        btn.current!.disabled = true;
        // console.log(btn.current!.innerHTML);
        // prettier-ignore
        axios.post(`${api_uri}/api/${passwordReset ? "reset_password" : "login_user"}`, {
            email: email.current!.value,
            password: password.current!.value,
        })
		.then(res => {
			const data = res.data as any;
            if (data.error || (!passwordReset && !data.token)) {
                setError(data.error ?? `Couldn't ${passwordReset ? "change password" : "login"}, servers are probably down.`);
            } else if(!passwordReset) {
                setSuccess("Logging in...");
                localStorage.setItem("access_token", data.token);
                window.location.href = "/home";
            } else {
                setSuccess("Check your email inbox to verify the password change.");
                btn.current!.disabled = true;
                setTimeout(() => {
                    btn.current!.disabled = false;
                }, 5000);
            }
        }).catch((err: AxiosError) => {
            if (err.code == AxiosError.ERR_NETWORK) setError(`Couldn't complete request, servers are probably down.`);
            if (err.code == AxiosError.ERR_BAD_REQUEST) setError(`Couldn't complete request because of a bad request!`);
        });
        setBtnText(passwordReset ? "Change Password" : "Login");
        btn.current!.disabled = false;
    };

    return (
        <div>
            <form onSubmit={Login}>
                <p style={{ fontSize: "10px", color: "transparent", marginTop: "70px" }}>Login</p>
                <input className="input-field" ref={email} name="email" placeholder={passwordReset ? "Email" : "Email or Handle"}></input>
                <input
                    className="input-field"
                    ref={password}
                    type="password"
                    name="password"
                    placeholder={passwordReset ? "New Password" : "Password"}
                ></input>
                <div style={{ marginBottom: "10px" }}></div>
                <button ref={btn} type="submit" className="button-field">
                    {btnText}
                </button>
                <p ref={error}></p>
                <a className="instead-anchor" onClick={() => setRegister(!isRegister)}>
                    {isRegister ? "Login Instead" : "Register Instead"}
                </a>
                <span style={{ color: "#ffffffc0" }}>
                    {" "}
                    -{" "}
                    {passwordReset ? (
                        <span
                            onClick={() => {
                                setPasswordReset(false);
                                setBtnText("Login");
                            }}
                            className="mention"
                        >
                            Back
                        </span>
                    ) : (
                        <>
                            Forgot Password?{" "}
                            <a
                                onClick={() => {
                                    setPasswordReset(true);
                                    setBtnText("Change Password");
                                }}
                                className="link"
                            >
                                Click Here
                            </a>{" "}
                            to reset it.
                        </>
                    )}
                </span>
                {children}
            </form>
        </div>
    );
}

export default LoginForm;
