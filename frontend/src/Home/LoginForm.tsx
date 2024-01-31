import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

interface Params {
    setRegister: (a: boolean) => void;
    isRegister: boolean;
}

function LoginForm({ setRegister, isRegister }: Params) {
    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);

    const Login = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // prettier-ignore
        axios.post("http://localhost:3000/api/login_user", {
            email: email.current!.value,
            password: password.current!.value,
        })
		.then(res => {
			const data = res.data as any;
			const error = data.error;
			const token = data.token;

			alert(error ? error : token);
        });
    };

    return (
        <div>
            <form onSubmit={Login}>
                <h1>Login</h1>
                <input ref={email} name="email" placeholder="Email or Handle"></input>
                <input ref={password} type="password" name="password" placeholder="Password"></input>
                <button>Login</button>
                <button onClick={() => setRegister(!isRegister)}>
                    {isRegister ? "Login Instead" : "Register Instead"}
                </button>
            </form>
        </div>
    );
}

export default LoginForm;
