import axios from "axios";
import { FormEvent, LegacyRef, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import "./Emoji.css";
import { UserPublic } from "../types/User";

function BeezleEmoji({ src, emoji_name }: { user: UserPublic; src: string; emoji_name: string }) {
    return (
        <div
            style={{
                backgroundImage: `url(${src})`,
            }}
            title={emoji_name}
            className="emoji"
        ></div>
    );
}

export default BeezleEmoji;
