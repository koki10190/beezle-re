import axios from "axios";
import { FormEvent, LegacyRef, MouseEventHandler, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import "./PostTyper.css";
import { api_uri } from "../links";
import { Post } from "../types/Post";

function PostTyper({ onSend }: { onSend: (data: Post) => void }) {
    const textarea = useRef<HTMLTextAreaElement>(null);
    const [canCreate, setCanCreate] = useState(true);

    const CreatePost = () => {
        (async () => {
            if (!textarea.current || !canCreate) return;

            const res = await axios.post(`${api_uri}/api/post/create`, {
                token: localStorage.getItem("access_token"),
                content: textarea.current.value,
            });

            console.log(res.data);
            onSend(res.data as Post);
            setCanCreate(false);
            textarea.current.value = "";

            setTimeout(() => {
                setCanCreate(true);
            }, 5 * 1000); // 5s
        })();
    };

    return (
        <div>
            <textarea ref={textarea} placeholder="Press here to type." className="post-typer"></textarea>
            <button onClick={CreatePost} className="button-field post-typer-button">
                Send
            </button>
        </div>
    );
}

export default PostTyper;
