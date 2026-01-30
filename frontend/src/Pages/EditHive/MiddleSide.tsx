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
    const [handle, setHandle] = useState("");
    const [description, setDescription] = useState("");
    const [name, setName] = useState("");
    const [delCheck, setDelCheck] = useState(false);

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
        e.preventDefault();
        buttonRef.current!.innerText = "Editing...";
        buttonRef.current!.disabled = true;

        let icon = hive.icon;
        let banner = hive.banner;
        buttonRef.current!.innerText = "Editing... | Uploading Icon";
        if (iconRef.current!.files && iconRef.current!.files.length > 0) icon = ((await UploadToImgur(iconRef.current!)) as any).data.link;
        buttonRef.current!.innerText = "Editing... | Uploading Banner";
        if (bannerRef.current!.files && bannerRef.current!.files.length > 0) banner = ((await UploadToImgur(bannerRef.current!)) as any).data.link;

        buttonRef.current!.innerText = "Editing...";

        const res = await axios.patch(
            `${api_uri}/api/hives/edit`,
            {
                icon,
                banner,
                name,
                description,
                handle,
                hive_id,
            },
            GetFullAuth(),
        );

        if (res.data.error) {
            toast.error(res.data.error);
            buttonRef.current!.innerText = "Edit";
            buttonRef.current!.disabled = false;
            return;
        }

        if (res.data.message) {
            toast.success(res.data.message);
            buttonRef.current!.innerText = "Edit";
            buttonRef.current!.disabled = false;
        }
    };

    const DeleteHive = async () => {
        const res = await axios.delete(`${api_uri}/api/hives/delete`, {
            params: {
                hive_id,
            },
            headers: GetAuthToken(),
        });

        if (res.data.error) {
            toast.error("There was an error while deleting: " + res.data.error);
            return;
        }

        if (res.data.message) {
            toast.success(res.data.message);
            setTimeout(() => {
                navigate("/home");
            }, 1000);
        }
    };

    useEffect(() => {
        (async () => {
            const hive = await FetchHive(hive_id);
            setHive(hive);
            console.log(hive);

            setName(hive.name);
            setHandle(hive.handle);
            setDescription(hive.description);

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

    if (hive?.owner !== self?.handle) {
        return (
            <div className="page-sides side-middle home-middle">
                <h1>You're not authorized to edit this hive!</h1>
            </div>
        );
    }

    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-bee"></i> Edit Hive
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
                <div
                    style={{
                        backgroundImage: `url(${hive.banner})`,
                    }}
                    ref={bannerDiv}
                    onClick={() => bannerRef.current!.click()}
                    className="hive-edit-banner"
                >
                    <p>Click Here To Edit Banner</p>
                </div>

                <input onChange={ApplyImageChange_Icon} ref={iconRef} className="display-none" type="file" accept=".jpeg,.gif,.png,.jpg" />
                <div
                    style={{
                        backgroundImage: `url(${hive.icon})`,
                    }}
                    ref={iconDiv}
                    onClick={() => iconRef.current!.click()}
                    className="hive-edit-icon"
                >
                    <p>Click Here To Edit Icon</p>
                </div>

                <label htmlFor="hive-name">Hive Name</label>
                <input
                    id="hive-name"
                    name="hive-name"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
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
                    value={handle}
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
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    placeholder="This is a hive to worship the bee queen and make shit ton of honey!"
                    maxLength={4000}
                    style={{ fontSize: "16px" }}
                    className="input-field textarea-field-sizing"
                ></textarea>

                <button ref={buttonRef} type="submit" style={{ width: "100%", marginTop: "5px" }} className="button-field">
                    Edit
                </button>
                <hr
                    style={{
                        width: "calc(100% + 40px)",
                        marginLeft: "-20px",
                        borderTop: "1px solid rgba(255, 255,255, 0.4)",
                    }}
                    className="divider"
                ></hr>
                <p style={{ fontFamily: "Open Sans", display: "inline" }}>I would like to delete the hive</p>
                <input
                    defaultChecked={delCheck}
                    onChange={() => setDelCheck((old) => !old)}
                    style={{ marginLeft: "10px", display: "inline" }}
                    className="input-checkbox"
                    type="checkbox"
                />
                <button onClick={DeleteHive} disabled={!delCheck} ref={buttonRef} type="button" className="button-field button-field-red">
                    <i className="fa-solid fa-trash" /> Delete Hive
                </button>
            </form>
        </div>
    );
}

export default MiddleSide;
