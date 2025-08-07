import axios, { all } from "axios";
import React, { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect, useNavigate, useParams } from "react-router-dom";
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
import "./MiddleSide.css";
import UploadToImgur from "../../functions/UploadToImgur";
import FetchHive from "../../functions/FetchHive";
import GetAuthToken from "../../functions/GetAuthHeader";

function MiddleSide() {
    const navigate = useNavigate();
    const { hive_id } = useParams();

    const [hive, setHive] = useState<BeezleHives.Hive>();
    const [self, setSelf] = useState<UserPrivate>();

    const iconRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);
    const iconDiv = useRef<HTMLDivElement>(null);
    const bannerDiv = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [kickUser, setKickUser] = useState("");
    const [postDelete, setPostDelete] = useState("");

    useEffect(() => {
        (async () => {
            const hive = await FetchHive(hive_id);
            setHive(hive);
            console.log(hive);

            setSelf(await fetchUserPrivate());
        })();
    }, []);

    if (!hive || !self) {
        return (
            <div className="page-sides side-middle home-middle">
                <h1>Loading Hive...</h1>
            </div>
        );
    }

    if (hive?.owner !== self?.handle || hive?.moderators?.findIndex((x) => x === self?.handle) < 0) {
        return (
            <div className="page-sides side-middle home-middle">
                <h1>You're not authorized to use the dashboard of this hive!</h1>
            </div>
        );
    }

    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-bee"></i> Hive Dashboard
            </h1>
            <p>Manage users & posts</p>
            <hr
                style={{
                    width: "calc(100% + 40px)",
                    marginLeft: "-20px",
                    borderTop: "1px solid rgba(255, 255,255, 0.4)",
                }}
                className="divider"
            ></hr>
            <div>
                <input
                    onChange={(e) => setKickUser(e.target.value)}
                    value={kickUser}
                    maxLength={32}
                    placeholder="Handle of an user to kick"
                    className="input-field"
                    style={{ width: "100%" }}
                />
                <button className="button-field button-field-red">
                    <i className="fa-solid fa-ban"></i> Kick User
                </button>
                <hr
                    style={{
                        width: "calc(100% + 40px)",
                        marginLeft: "-20px",
                        borderTop: "1px solid rgba(255, 255,255, 0.4)",
                    }}
                    className="divider"
                ></hr>
                <input
                    onChange={(e) => setPostDelete(e.target.value)}
                    value={postDelete}
                    maxLength={32}
                    placeholder="Post ID to delete"
                    className="input-field"
                    style={{ width: "100%" }}
                />
                <button className="button-field button-field-red">
                    <i className="fa-solid fa-ban"></i> Delete Post
                </button>
                <hr
                    style={{
                        width: "calc(100% + 40px)",
                        marginLeft: "-20px",
                        borderTop: "1px solid rgba(255, 255,255, 0.4)",
                    }}
                    className="divider"
                ></hr>
            </div>
        </div>
    );
}

export default MiddleSide;
