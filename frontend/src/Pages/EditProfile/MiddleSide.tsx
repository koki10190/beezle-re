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
import { toast } from "react-toastify";
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react";
import { AVATAR_SHAPES, AvaterShape } from "../../types/cosmetics/AvatarShapes";
import GetAuthToken from "../../functions/GetAuthHeader";
import { STEAM_ICON_URL } from "../../types/steam/steam_urls";
import GetFullAuth from "../../functions/GetFullAuth";
import { STATUS, STATUS_ID, StatusEnum } from "../../types/Status";

function Loading() {
    return (
        <div className="profile">
            <div className="pfp"></div>
            <p className="username"></p>
            <p className="handle"></p>
        </div>
    );
}

enum BuyWhat {
    PROFILE_GRADIENT,
    NAME_COLOR,
}

function Loaded({ user }: { user: UserPublic | UserPrivate }) {
    const [username, setUsername] = useState<string>(user.username);
    const [about_me, setAboutMe] = useState<string>(user.about_me);
    const [activity, setActivity] = useState<string>(user.activity);
    const [status, setStatus] = useState<string>(user.status ?? "online");
    const [avatarShape, setAvatarShape] = useState<AvaterShape>(user.customization?.square_avatar ?? AvaterShape.SquareAvatarShape);
    const [profileBgImg, setProfileBgImage] = useState(user.customization?.profile_postbox_img_bought ? user.customization.profile_postbox_img : "");
    const [g1, setG1] = useState<string>(user.customization?.profile_gradient ? user.customization.profile_gradient.color1 : "#000000");
    const [g2, setG2] = useState<string>(user.customization?.profile_gradient ? user.customization.profile_gradient.color2 : "#000000");
    const [ng1, setNG1] = useState<string>(user.customization?.name_color ? user.customization.name_color.color1 : "#000000");
    const [ng2, setNG2] = useState<string>(user.customization?.name_color ? user.customization.name_color.color2 : "#000000");
    const [isEmojiPickerOpened, setEmojiPickerOpened] = useState(false);
    const bannerOverlay = useRef<HTMLDivElement>(null);
    const avatarOverlay = useRef<HTMLDivElement>(null);
    const avatarInput = useRef<HTMLInputElement>(null);
    const bannerInput = useRef<HTMLInputElement>(null);
    const profileBgImgInput = useRef<HTMLInputElement>(null);
    const avatarDiv = useRef<HTMLDivElement>(null);
    const bannerDiv = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Connections
    const [steamInventory, setSteamInventory] = useState<Steam.InventoryJSON>();

    useEffect(() => {
        (async () => {
            if (!user.connections?.steam?.id) return;
            // const steam_inventory_res = await axios.get(`${api_uri}/api/connections/steam_get_inventory`, {
            //     params: {
            //         steam_id: user.connections.steam.id,
            //         app_id: 730,
            //     },
            //     headers: GetAuthToken(),
            // });
            // console.log(steam_inventory_res.data);
            // setSteamInventory(steam_inventory_res.data);
        })();
    }, []);

    const ActivateOverlay = (ref: HTMLDivElement) => {
        ref.style.display = "flex";
    };

    const DeactivateOverlay = (ref: HTMLDivElement) => {
        ref.style.display = "none";
    };

    const Buy = async (buy_what: BuyWhat) => {
        let res = null;
        switch (buy_what) {
            case BuyWhat.PROFILE_GRADIENT: {
                res = await axios.post(
                    `${api_uri}/api/user/buy/profile_gradient`,
                    {},
                    {
                        headers: GetAuthToken(),
                    },
                );
                break;
            }
            case BuyWhat.NAME_COLOR: {
                res = await axios.post(
                    `${api_uri}/api/user/buy/name_color`,
                    {},
                    {
                        headers: GetAuthToken(),
                    },
                );
                break;
            }
        }

        if (res.data.bought) {
            toast.success("Successfully bought the item!");
            window.location.reload();
        } else {
            toast.error(res.data.error);
        }
    };

    const SaveChanges = (e: any) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        let avatar: string | null = null;
        let banner: string | null = null;
        let __ProfileBgImage: string | null = null;
        console.log(g1);
        console.log(g2);

        (async () => {
            buttonRef.current!.disabled = true;
            buttonRef.current!.innerText = "Saving Changes...";
            if (avatarInput.current!.files && avatarInput.current!.files.length > 0)
                avatar = ((await UploadToImgur(avatarInput.current!)) as any).data.link;
            if (bannerInput.current!.files && bannerInput.current!.files.length > 0)
                banner = ((await UploadToImgur(bannerInput.current!)) as any).data.link;

            // if (profileBgImg !== "") {
            //     __ProfileBgImage = ((await UploadToImgur(profileBgImgInput.current!)) as any).data.link;
            // }

            const data = {
                username: username == "" ? user.username : username,
                avatar: avatar ? avatar : user.avatar,
                banner: banner ? banner : user.banner,
                about_me,
                activity,
                profile_gradient1: g1,
                profile_gradient2: g2,
                name_color1: ng1,
                name_color2: ng2,
                avatar_shape: avatarShape,
                status,
                profile_postbox_img: __ProfileBgImage ? __ProfileBgImage : "",
            };
            console.log(data);
            const m_data = (
                await axios.patch(`${api_uri}/api/profile/edit`, data, {
                    headers: GetAuthToken(),
                })
            ).data;
            if (m_data.changed) {
                toast.success("Profile has been edited successfully");
            } else {
                toast.error(m_data.error);
            }

            buttonRef.current!.disabled = false;
            buttonRef.current!.innerText = "Save Changes";
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
                <input onChange={ApplyImageChange_Banner} className="display-none" type="file" ref={bannerInput} accept=".jpeg,.gif,.png,.jpg" />
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
                <input onChange={ApplyImageChange_Avatar} className="display-none" type="file" ref={avatarInput} accept=".jpeg,.gif,.png,.jpg" />

                <div onClick={() => avatarInput.current!.click()} ref={avatarOverlay} className="pfp-edit-overlay">
                    <p>Upload Avatar</p>
                </div>
            </div>
            <input
                style={{
                    marginTop: "-110px",
                }}
                className="username input-field username-edit"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <div style={{ marginTop: "82px" }}>
                <div className="profile-container-nom">
                    <p className="profile-container-header">
                        <i className="fa-solid fa-user"></i> About Me
                    </p>
                    <textarea
                        maxLength={1000}
                        value={about_me}
                        onChange={(e) => setAboutMe(e.target.value)}
                        className="about_me input-field textarea-field-sizing"
                    >
                        {user.about_me}
                    </textarea>
                    <a
                        onClick={() => {
                            setEmojiPickerOpened(!isEmojiPickerOpened);
                        }}
                        style={{
                            fontSize: "17px",
                        }}
                        className="post-typer-button"
                    >
                        <i className="fa-solid fa-face-awesome" /> Emojis
                    </a>
                    {isEmojiPickerOpened ? (
                        <EmojiPicker
                            onEmojiClick={(emojiData: EmojiClickData, event: MouseEvent) => {
                                setAboutMe((old) => {
                                    const _new = old;
                                    return _new + (emojiData.isCustom ? `<:${emojiData.emoji}:> ` : emojiData.emoji);
                                });
                            }}
                            customEmojis={user.customization?.emojis ? user.customization?.emojis : []}
                            theme={Theme.DARK}
                            emojiStyle={EmojiStyle.NATIVE}
                            className="post-typer-emoji-picker"
                        />
                    ) : (
                        ""
                    )}
                </div>
                <div className="profile-container-nom">
                    <p className="profile-container-header">
                        <i className="fa-solid fa-person-running-fast"></i> Activity
                    </p>
                    <textarea maxLength={35} value={activity} onChange={(e) => setActivity(e.target.value)} className="about_me input-field">
                        {user.activity}
                    </textarea>
                </div>
                <div className="profile-container-nom">
                    <p className="profile-container-header">
                        <i className="fa-solid fa-signal"></i> Status
                    </p>
                    <br></br>
                    <select
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setStatus(e.target.value);
                        }}
                        style={{ width: "100%" }}
                        className="input-field"
                    >
                        {STATUS.map((st, index) => (
                            <option value={STATUS_ID[index]} selected={STATUS_ID[index] === status}>
                                {st}
                            </option>
                        ))}
                    </select>
                    <br />
                </div>
                {user.customization?.profile_gradient_bought ? (
                    <div className="profile-container-nom">
                        <p className="profile-container-header">
                            <i className="fa-solid fa-fill-drip"></i> Profile Gradient
                        </p>
                        <input
                            value={g1}
                            onChange={(e) => setG1(e.target.value)}
                            className="about_me color-picker"
                            style={{ marginBottom: "-15px" }}
                            type="color"
                        />
                        <input value={g2} onChange={(e) => setG2(e.target.value)} className="about_me color-picker" type="color" />
                    </div>
                ) : (
                    ""
                )}
                {user.customization?.name_color_bought ? (
                    <div className="profile-container-nom">
                        <p className="profile-container-header">
                            <i className="fa-solid fa-palette"></i> Name Color Gradient
                        </p>
                        <input
                            value={ng1}
                            onChange={(e) => setNG1(e.target.value)}
                            className="about_me color-picker"
                            style={{ marginBottom: "-15px" }}
                            type="color"
                        />
                        <input value={ng2} onChange={(e) => setNG2(e.target.value)} className="about_me color-picker" type="color" />
                    </div>
                ) : (
                    ""
                )}
                <div className="profile-container-nom">
                    <p className="profile-container-header">
                        <i className="fa-solid fa-hexagon"></i> Avatar Shape
                    </p>
                    <br></br>
                    <select
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setAvatarShape(parseInt(e.target.value) as AvaterShape);
                        }}
                        style={{ width: "100%" }}
                        className="input-field"
                    >
                        <option selected={(user.customization?.square_avatar ?? 0) === 0} value={0}>
                            Circle Avatar Shape
                        </option>
                        {user.customization?.owned_shapes?.map((shape) => {
                            return (
                                <option selected={shape === user?.customization.square_avatar} value={shape}>
                                    {AVATAR_SHAPES[shape].name}
                                </option>
                            );
                        })}
                    </select>
                    <br />
                </div>
                {/* {user.connections?.steam?.id && steamInventory?.descriptions ? (
                    <div className="profile-container-nom">
                        <p className="profile-container-header">
                            <i className="fa-brands fa-steam" /> Steam Inventory
                        </p>
                        <div
                            style={{ "--cols": Math.ceil(steamInventory.descriptions.length / 5) } as React.CSSProperties}
                            className="steam-inventory-container"
                        >
                            {steamInventory.descriptions.map((item: Steam.RGDecsription) => {
                                return (
                                    <div
                                        title={item.name}
                                        onClick={() => window.open(item.actions[0].link, "_blank")}
                                        className="steam-inventory-box"
                                    >
                                        <div
                                            className="steam-inventory-image"
                                            style={{
                                                border: `solid 2px #${item.name_color ?? "FFFFFF"}`,
                                                backgroundImage: `url(${STEAM_ICON_URL}${item.icon_url})`,
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    ""
                )} */}
                {/* {user.customization?.profile_postbox_img_bought ? (
                    <div className="profile-container-nom">
                        <p className="profile-container-header">
                            Profile Background Image (Overrides gradient on posts)
                        </p>
                        <input
                            ref={profileBgImgInput}
                            className="about_me input-field"
                            type="file"
                            accept=".jpeg,.gif,.png,.jpg"
                        />
                    </div>
                ) : (
                    ""
                )} */}
                {/* {user.customization?.square_avatar_bought ? (
                    <>
                        <p style={{ display: "inline" }}>Square Avatar</p>
                        <input
                            defaultChecked={squareAvatar}
                            onChange={() => setSquareAvatar((old) => !old)}
                            style={{ marginLeft: "10px", display: "inline" }}
                            className="input-checkbox"
                            type="checkbox"
                        />
                    </>
                ) : (
                    ""
                )} */}
            </div>

            <br />
            <button ref={buttonRef} type="submit" className="button-field fixed-100">
                Save Changes
            </button>
        </form>
    );
}

function MiddleSide() {
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
