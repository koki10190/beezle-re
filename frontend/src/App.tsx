import axios from 'axios';
import { FormEvent, useRef, useState } from 'react'
function App() {
	const handle = useRef<HTMLInputElement>(null);
	const username = useRef<HTMLInputElement>(null);
	const email = useRef<HTMLInputElement>(null);
	const password = useRef<HTMLInputElement>(null);
	
	const register = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log(handle.current!.value);
		axios.post("http://localhost:3000/api/register_user", 
			{
				username: "koki1019",
				handle: "koki",
				email: "lukaodzelashvili@gmail.com",
				password: "1234"
			}
		).then(res => {
			console.log(res.data);
		})
	}

	return (
		<>
			<h1>Register</h1>
			<form onSubmit={register}>
				<input ref={handle} name="handle" placeholder='handle'></input>
				<input name="username" placeholder='username'></input>
				<input name="email" placeholder='email'></input>
				<input name="password" placeholder='password'></input>
				<button>submit</button>
			</form>
		</>
	)
}

export default App
