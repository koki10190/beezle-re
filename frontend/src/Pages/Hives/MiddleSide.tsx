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
import HiveBox from "./HiveBox";

enum HivePages {
    SEARCH,
    JOINED,
}

function MiddleSide() {
    const navigate = useNavigate();
    const buttonRef = useRef<HTMLButtonElement>();
    const [search, setSearch] = useState("");
    const [hives, setHives] = useState<Array<BeezleHives.Hive>>([]);
    const [joinedHives, setJoinedHives] = useState<Array<BeezleHives.Hive>>([]);
    const [page, setPage] = useState<HivePages>(HivePages.SEARCH);
    const [postOffset, setPostOffset] = useState(0);

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

    const JoinedHives = async () => {
        if (joinedHives.length > 0) return;
        const res = await axios.get(`${api_uri}/api/hives/get/joined_hives`, GetFullAuth());
        setJoinedHives(res.data.hives);
    };

    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-bee"></i> Hives
            </h1>
            <p>
                Discover hives to be apart of inside Beezle
                <span style={{ fontSize: "15px" }} className="home-box-title-re">
                    :RE
                </span>{" "}
                that fits your interests!
            </p>
            <hr
                style={{
                    width: "calc(100% + 40px)",
                    marginLeft: "-20px",
                    borderTop: "1px solid rgba(255, 255,255, 0.4)",
                }}
                className="divider"
            ></hr>
            <form onSubmit={Search} className="hives-search-container">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name, URL or an ID of a Hive"
                    className="input-field"
                    style={{ width: "100%" }}
                />
                <button ref={buttonRef} style={{ width: "100%" }} className="button-field button-field-blurple">
                    Search
                </button>
                <p>
                    Cannot find a Hive related to your interests?{" "}
                    <a onClick={() => navigate("/hives/create")} className="mention">
                        Create one yourself and be the bee queen!
                    </a>
                </p>
                <button
                    style={{ display: "inline-block", marginRight: "10px" }}
                    type="button"
                    onClick={() => setPage(HivePages.SEARCH)}
                    className="button-field button-field-blurple"
                >
                    <i className="fa-solid fa-bee"></i> Search Hives
                </button>
                <button
                    style={{ display: "inline-block", marginRight: "10px" }}
                    type="button"
                    onClick={() => {
                        setPage(HivePages.JOINED);
                        JoinedHives();
                    }}
                    className="button-field button-field-blue"
                >
                    <i className="fa-solid fa-bee"></i> See Joined Hives
                </button>
            </form>
            <hr
                style={{
                    width: "calc(100% + 40px)",
                    marginLeft: "-20px",
                    borderTop: "1px solid rgba(255, 255,255, 0.4)",
                }}
                className="divider"
            ></hr>
            <p>{page === HivePages.SEARCH ? "Searched Hives:" : "Joined Hives:"}</p>
            {page === HivePages.SEARCH
                ? hives.map((hive, index) => {
                      return <HiveBox hive={hive} key={hive.hive_id} />;
                  })
                : joinedHives.map((hive, index) => {
                      return <HiveBox hive={hive} joined={true} key={hive.hive_id} />;
                  })}
        </div>
    );
}

export default MiddleSide;
