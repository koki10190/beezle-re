import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

interface Params {
    setRegister: (a: boolean) => void;
    isRegister: boolean;
}

function RegisterForm({ setRegister, isRegister }: Params) {
    const handle = useRef<HTMLInputElement>(null);
    const username = useRef<HTMLInputElement>(null);
    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);

    const register = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(handle.current!.value);
        axios
            .post("http://localhost:3000/api/register_user", {
                username: username.current!.value,
                handle: handle.current!.value,
                email: email.current!.value,
                password: password.current!.value,
            })
            .then(res => {
                const data = res.data as any;
                if (data["error"]) {
                    alert(data.error);
                } else {
                    alert(data.token);
                }
            });
    };

    return (
        <>
            <h1>Register</h1>
            <form onSubmit={register}>
                <input ref={handle} name="handle" placeholder="handle"></input>
                <input ref={username} name="username" placeholder="username"></input>
                <input ref={email} type="email" name="email" placeholder="email"></input>
                <input ref={password} type="password" name="password" placeholder="password"></input>
                <button>Register</button>
                <button onClick={() => setRegister(!isRegister)}>
                    {isRegister ? "Login Instead" : "Register Instead"}
                </button>
            </form>
        </>
    );
}

export default RegisterForm;
