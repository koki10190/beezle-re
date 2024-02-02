import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import React from "react";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import "./EditProfile.css";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import { BadgesToJSX } from "../../functions/badgesToJSX";
import UploadToImgur from "../../functions/UploadToImgur";

function Loading() {
    return (
        <div className="profile">
            <div className="pfp"></div>
            <p className="username"></p>
            <p className="handle"></p>
        </div>
    );
}

function Loaded({ user }: { user: UserPublic | UserPrivate }) {
    const [username, setUsername] = useState<string>(user.username);
    const [about_me, setAboutMe] = useState<string>(user.about_me);
    const bannerOverlay = useRef<HTMLDivElement>(null);
    const avatarOverlay = useRef<HTMLDivElement>(null);
    const avatarInput = useRef<HTMLInputElement>(null);
    const bannerInput = useRef<HTMLInputElement>(null);
    const avatarDiv = useRef<HTMLDivElement>(null);
    const bannerDiv = useRef<HTMLDivElement>(null);

    const ActivateOverlay = (ref: HTMLDivElement) => {
        ref.style.display = "flex";
    };

    const DeactivateOverlay = (ref: HTMLDivElement) => {
        ref.style.display = "none";
    };

    const SaveChanges = (e: any) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        let avatar: string | null = null;
        let banner: string | null = null;

        (async () => {
            if (avatarInput.current!.files && avatarInput.current!.files.length > 0)
                avatar = ((await UploadToImgur(avatarInput.current!)) as any).data.link;
            if (bannerInput.current!.files && bannerInput.current!.files.length > 0)
                banner = ((await UploadToImgur(bannerInput.current!)) as any).data.link;

            const data = {
                username: username == "" ? user.username : username,
                token: localStorage.getItem("access_token"),
                avatar: avatar ? avatar : user.avatar,
                banner: banner ? banner : user.banner,
                about_me,
            };
            const m_data = (await axios.post(`${api_uri}/api/profile/edit`, data)).data;
            if (m_data.changed) {
                alert("Your profile has been edited");
            } else {
                alert(m_data.error);
            }
        })();
    };

    const ApplyImageChange_Avatar = (e: any) => {
        const target = avatarDiv.current!;
        const files = avatarInput.current!.files as FileList;
        const link = window.URL.createObjectURL(files[0]);
        target.style.backgroundImage = `url(${link})`;
    };

    const ApplyImageChange_Banner = (e: any) => {
        const target = bannerDiv.current!;
        const files = bannerInput.current!.files as FileList;
        const link = window.URL.createObjectURL(files[0]);
        target.style.backgroundImage = `url(${link})`;
    };

    return (
        <form onSubmit={SaveChanges} className="profile">
            <div
                ref={bannerDiv}
                onMouseEnter={() => ActivateOverlay(bannerOverlay.current as HTMLDivElement)}
                onMouseLeave={() => DeactivateOverlay(bannerOverlay.current as HTMLDivElement)}
                style={{
                    backgroundImage: `url(${user.banner})`,
                }}
                className="banner pfp-edit"
            >
                <input
                    onChange={ApplyImageChange_Banner}
                    className="display-none"
                    type="file"
                    ref={bannerInput}
                    accept=".jpeg,.gif,.png,.jpg"
                />
                <div onClick={() => bannerInput.current!.click()} ref={bannerOverlay} className="pfp-edit-overlay">
                    <p>Upload Banner</p>
                </div>
            </div>
            <div
                ref={avatarDiv}
                onMouseEnter={() => ActivateOverlay(avatarOverlay.current as HTMLDivElement)}
                onMouseLeave={() => DeactivateOverlay(avatarOverlay.current as HTMLDivElement)}
                style={{
                    backgroundImage: `url(${user.avatar})`,
                }}
                className="pfp pfp-edit"
            >
                <input
                    onChange={ApplyImageChange_Avatar}
                    className="display-none"
                    type="file"
                    ref={avatarInput}
                    accept=".jpeg,.gif,.png,.jpg"
                />

                <div onClick={() => avatarInput.current!.click()} ref={avatarOverlay} className="pfp-edit-overlay">
                    <p>Upload Avatar</p>
                </div>
            </div>
            <input className="username input-field" value={username} onChange={e => setUsername(e.target.value)} />
            <div className="profile-container">
                <p className="profile-container-header">About Me</p>
                <textarea
                    maxLength={1000}
                    value={about_me}
                    onChange={e => setAboutMe(e.target.value)}
                    className="about_me input-field"
                >
                    {user.about_me}
                </textarea>
            </div>
            <button type="submit" style={{ marginTop: "80px" }} className="button-field fixed-100">
                Save Changes
            </button>
        </form>
    );
}

function MiddleSide() {
    checkToken();
    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);

    useEffect(() => {
        (async () => {
            if (localStorage.getItem("access_token")) {
                setSelfUser(await fetchUserPrivate());
            }
        })();
    }, []);

    return <div className="page-sides side-middle">{self_user ? <Loaded user={self_user} /> : <Loading />}</div>;
}

export default MiddleSide;
