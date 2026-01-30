import axios, { all } from "axios";
import { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect, useNavigate } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import PostTyper from "../../Components/PostTyper";
import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { RefreshPosts } from "../../functions/RefreshPosts";
import GetFullAuth from "../../functions/GetFullAuth";
import { toast } from "react-toastify";
import GetAuthToken from "../../functions/GetAuthHeader";

function MiddleSide() {
    const navigate = useNavigate();
    const buttonRef = useRef<HTMLButtonElement>();
    const [search, setSearch] = useState("");
    const [hives, setHives] = useState<Array<BeezleHives.Hive>>([]);

    const Search = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        buttonRef.current!.innerText = "Searching...";
        buttonRef.current!.disabled = true;

        const res = await axios.get(`${api_uri}/api/hives/search`, {
            params: {
                search,
            },
            headers: GetAuthToken(),
        });

        buttonRef.current!.innerText = "Search";
        buttonRef.current!.disabled = false;

        setHives(res.data.hives);
    };

    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-bee"></i> Joined Hives
            </h1>
            <hr
                style={{
                    width: "calc(100% + 40px)",
                    marginLeft: "-20px",
                    borderTop: "1px solid rgba(255, 255,255, 0.4)",
                }}
                className="divider"
            ></hr>
        </div>
    );
}

export default MiddleSide;
