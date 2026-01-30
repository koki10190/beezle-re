import axios, { all } from "axios";
import React, { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
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
import "./MiddleSide.css";
import UploadToImgur from "../../functions/UploadToImgur";

function MiddleSide() {
    const navigate = useNavigate();

    const iconRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);
    const iconDiv = useRef<HTMLDivElement>(null);
    const bannerDiv = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [handle_, setHandle] = useState("");

    const [data, setData] = useState<HiveEditData>({
        icon: "",
        banner: "",
        description: "",
        name: "",
        handle: "",
    });

    const ApplyImageChange_Banner = (e: any) => {
        const target = bannerDiv.current!;
        const files = bannerRef.current!.files as FileList;
        const link = window.URL.createObjectURL(files[0]);
        target.style.backgroundImage = `url(${link})`;
    };

    const ApplyImageChange_Icon = (e: any) => {
        const target = iconDiv.current!;
        const files = iconRef.current!.files as FileList;
        const link = window.URL.createObjectURL(files[0]);
        target.style.backgroundImage = `url(${link})`;
    };

    const CreateHive = async (e: React.FormEvent<HTMLFormElement>) => {
        console.log((e.currentTarget.elements.namedItem("hive-handle") as any).value);
        e.preventDefault();
        buttonRef.current!.innerText = "Creating...";
        buttonRef.current!.disabled = true;
        const handle = handle_.replace(" ", "");
        let regex = new RegExp("[^0-9a-zA-Z-,_.:s]+");
        if (regex.test(handle)) {
            toast.error("No Special Characters Allowed!");
            return;
        }
        const name = (e.currentTarget.elements.namedItem("hive-name") as HTMLInputElement).value;
        const description = (e.currentTarget.elements.namedItem("hive-desc") as HTMLTextAreaElement).value;

        let icon = "https://i.imgur.com/uUWn8fn.png";
        let banner = "https://i.imgur.com/uUWn8fn.png";
        buttonRef.current!.innerText = "Creating... | Uploading Icon";
        if (iconRef.current!.files && iconRef.current!.files.length > 0) icon = ((await UploadToImgur(iconRef.current!)) as any).data.link;
        buttonRef.current!.innerText = "Creating... | Uploading Banner";
        if (bannerRef.current!.files && bannerRef.current!.files.length > 0) banner = ((await UploadToImgur(bannerRef.current!)) as any).data.link;
        buttonRef.current!.innerText = "Creating...";
        const res = await axios.post(
            `${api_uri}/api/hives/create`,
            {
                handle,
                name,
                description,
                icon,
                banner,
            },
            GetFullAuth(),
        );

        if (res.data.error) {
            console.error(res.data.error);
            toast.error(res.data.error);
            buttonRef.current!.innerText = "Create";
            buttonRef.current!.disabled = false;
        }

        if (res.data.message) {
            toast.success(res.data.message);
            console.log(res.data.hive);
            buttonRef.current!.innerText = "Created!";
            setTimeout(() => {
                navigate("/hive/" + handle);
            }, 1500);
        }
    };

    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-bee"></i> Create a Hive
            </h1>
            <p>
                Create a hive of your own inside Beezle
                <span style={{ fontSize: "15px" }} className="home-box-title-re">
                    :RE
                </span>
                !
            </p>
            <hr
                style={{
                    width: "calc(100% + 40px)",
                    marginLeft: "-20px",
                    borderTop: "1px solid rgba(255, 255,255, 0.4)",
                }}
                className="divider"
            ></hr>
            <form onSubmit={CreateHive} className="hives-search-container">
                <input onChange={ApplyImageChange_Banner} ref={bannerRef} className="display-none" type="file" accept=".jpeg,.gif,.png,.jpg" />
                <div ref={bannerDiv} onClick={() => bannerRef.current!.click()} className="hive-edit-banner">
                    <p>Click Here To Edit Banner</p>
                </div>

                <input onChange={ApplyImageChange_Icon} ref={iconRef} className="display-none" type="file" accept=".jpeg,.gif,.png,.jpg" />
                <div ref={iconDiv} onClick={() => iconRef.current!.click()} className="hive-edit-icon">
                    <p>Click Here To Edit Icon</p>
                </div>

                <label htmlFor="hive-name">Hive Name</label>
                <input
                    id="hive-name"
                    name="hive-name"
                    maxLength={32}
                    placeholder="Name, URL or an ID of a Hive"
                    className="input-field"
                    style={{ width: "100%" }}
                />

                <label htmlFor="hive-handle">Hive Handle</label>
                <input
                    id="hive-handle"
                    name="hive-handle"
                    onChange={(e) => setHandle(e.target.value.replace(" ", ""))}
                    value={handle_}
                    required
                    maxLength={16}
                    placeholder="Access your hive via beezle.lol/hives/handle"
                    className="input-field"
                    style={{ width: "100%" }}
                />

                <label htmlFor="hive-desc">Hive's Description</label>
                <textarea
                    id="hive-desc"
                    name="hive-desc"
                    placeholder="This is a hive to worship the bee queen and make shit ton of honey!"
                    maxLength={4000}
                    style={{ fontSize: "16px" }}
                    className="input-field textarea-field-sizing"
                ></textarea>

                <button ref={buttonRef} type="submit" style={{ width: "100%", marginTop: "5px" }} className="button-field">
                    Create
                </button>
            </form>
        </div>
    );
}

export default MiddleSide;
