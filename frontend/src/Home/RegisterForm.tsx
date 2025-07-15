import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { api_uri } from "../links";

interface Params {
    setRegister: (a: boolean) => void;
    isRegister: boolean;
}

function RegisterForm({ setRegister, isRegister }: Params) {
    const handle = useRef<HTMLInputElement>(null);
    const username = useRef<HTMLInputElement>(null);
    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const error = useRef<HTMLParagraphElement>(null);
    const registerBtn = useRef<HTMLButtonElement>(null);

    const setError = (err: string) => {
        error.current!.innerText = err;
        error.current!.style.color = "red";
    };

    const setSuccess = (err: string) => {
        error.current!.innerText = err;
        error.current!.style.color = "lime";
    };

    const register = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        registerBtn.current.disabled = true;

        const s_username = username.current!.value;
        const s_handle = handle.current!.value;
        const s_email = email.current!.value;
        const s_password = password.current!.value;

        if (s_username === "" || s_handle === "" || s_email === "") return;

        if (s_password.length < 8) {
            setError("Password cannot be shorter than 8 characters!");
            registerBtn.current.disabled = false;
            return;
        }
        let regex = new RegExp("[^0-9a-zA-Z-,_.:s]+");
        if (regex.test(s_handle)) {
            setError("No special characters are allowed in handles!");
            registerBtn.current.disabled = false;
            return;
        }

        axios
            .post(`${api_uri}/api/register_user`, {
                username: s_username,
                handle: s_handle,
                email: s_email,
                password: s_password,
            })
            .then((res) => {
                const data = res.data as any;
                if (data.error) {
                    setError(data.error);
                    registerBtn.current.disabled = false;
                } else {
                    setSuccess(data.message);
                }
            });
    };

    return (
        <div>
            <form onSubmit={register}>
                <p style={{ fontSize: "10px", color: "transparent", marginTop: "70px" }}>Register</p>
                <input className="input-field" ref={handle} name="handle" placeholder="Handle"></input>
                <input className="input-field" ref={username} name="username" placeholder="Display Name"></input>
                <input className="input-field" ref={email} type="email" name="email" placeholder="Email"></input>
                <input className="input-field" ref={password} type="password" name="password" placeholder="Password"></input>
                <div style={{ marginBottom: "10px" }}></div>
                <button ref={registerBtn} className="button-field">
                    Register
                </button>
                <p ref={error}></p>
                <a className="instead-anchor" onClick={() => setRegister(!isRegister)}>
                    {isRegister ? "Login Instead" : "Register Instead"}
                </a>
            </form>
        </div>
    );
}

export default RegisterForm;
