import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate } from "../../../functions/fetchUserPrivate";
import { UserPrivate } from "../../../types/User";
import { Post } from "../../../types/Post";
import FetchPost from "../../../functions/FetchPost";
import "./Details.css";
import Divider from "../../../Components/Divider";
import { api_uri } from "../../../links";
import axios from "axios";
import PopupToSteamAuth from "../../../functions/RedirectToSteamAuth";
import { CustomEmoji } from "emoji-picker-react/dist/config/customEmojiConfig";
import UploadToImgur from "../../../functions/UploadToImgur";
import { toast } from "react-toastify";
import GetAuthToken from "../../../functions/GetAuthHeader";

interface Props {
    user: UserPrivate;
}

interface DUE_Props extends Props {
    emoji: CustomEmoji;
}

function DisplayUploadedEmojis({ user, emoji }: DUE_Props) {
    return (
        <>
            <div
                style={{
                    width: "50px",
                    height: "50px",
                    marginBottom: "5px",
                    backgroundImage: `url(${emoji.imgUrl})`,
                }}
                title={emoji.id}
                className="emoji"
            />{" "}
        </>
    );
}

function CustomEmojis({ user }: Props) {
    const [hovered, setHovered] = useState(false);
    const imgRef = useRef<HTMLInputElement>(null);
    const idRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const SetPreview = async () => {
        const target = previewRef.current!;
        const files = imgRef.current!.files as FileList;
        const link = window.URL.createObjectURL(files[0]);
        target.style.backgroundImage = `url(${link})`;
    };

    const UploadEmoji = async () => {
        let emoji_img: string | null = null;

        const format = /[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/? ]+/g;
        if (format.test(idRef.current!.value)) return toast.warn("No special characters or spaces allowed.");
        console.log(imgRef.current!);
        if (imgRef.current!.files && imgRef.current!.files.length > 0) emoji_img = ((await UploadToImgur(imgRef.current!)) as any).data.link;

        if (!emoji_img) return toast.info("Please select an image.");

        buttonRef.current!.disabled = true;
        buttonRef.current!.innerText = "Uploading...";

        // do stuff here

        const res = await axios.post(
            `${api_uri}/api/user/upload_emoji`,
            {
                emoji_url: emoji_img,
                emoji_id: idRef.current!.value.toLowerCase(),
            },
            {
                headers: GetAuthToken(),
            },
        );

        if (res.data.error) toast.error(res.data.error);
        else toast.success(res.data.message);

        buttonRef.current!.disabled = false;
        buttonRef.current!.innerText = "Upload Emoji";

        window.location.reload();
    };

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>
                    <i className="fa-solid fa-icons"></i> Custom Emojis
                </h1>
                <Divider />
                <div
                    ref={previewRef}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={() => imgRef.current!.click()}
                    className="emoji-preview"
                >
                    <div
                        style={{
                            display: hovered ? "flex" : "none",
                        }}
                        className="emoji-preview-text"
                    >
                        Upload{" "}
                    </div>
                </div>
                <input onChange={SetPreview} required style={{ display: "none" }} type="file" ref={imgRef} accept=".jpeg,.gif,.png,.jpg" />
                <input
                    required
                    maxLength={32}
                    className="input-field fixed-100"
                    placeholder="Emoji ID (No special characters or spaces, only _, letters and numbers)"
                    ref={idRef}
                />
                <p style={{ marginTop: "25px", marginBottom: "0px" }}>
                    Costs <i className="fa-solid fa-coins" /> 500
                </p>
                <button onClick={UploadEmoji} style={{ marginBottom: "25px" }} ref={buttonRef} type="submit" className="button-field">
                    Upload Emoji
                </button>

                {user.customization?.emojis && user.customization?.emojis?.length > 0
                    ? user.customization?.emojis.map((emoji) => {
                          return <DisplayUploadedEmojis key={emoji.id} emoji={emoji} user={user} />;
                      })
                    : "No custom emojis uploaded."}
            </div>
        </>
    );
}

export default CustomEmojis;
