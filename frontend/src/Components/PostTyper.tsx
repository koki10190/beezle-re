import axios from "axios";
import { FormEvent, LegacyRef, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import "./PostTyper.css";

function PostTyper({ ref }: { ref: LegacyRef<HTMLTextAreaElement> }) {
    return (
        <div>
            <textarea placeholder="Press here to type." ref={ref} className="post-typer"></textarea>
            <button className="button-field post-typer-button">Send</button>
        </div>
    );
}

export default PostTyper;
