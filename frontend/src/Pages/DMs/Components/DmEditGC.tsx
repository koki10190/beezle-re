import axios from "axios";

import ReactDOMServer from "react-dom/server";
import React, { useEffect, useRef, useState, UIEvent, forwardRef } from "react";
import Divider from "../../../Components/Divider";
import UploadToImgurVideoByFile from "../../../functions/UploadToImgurVideoByFile";
import { toast } from "react-toastify";
import { api_uri } from "../../../links";
import GetFullAuth from "../../../functions/GetFullAuth";

function DmEditGC({
    setOptions,
    options,
    gc,
}: {
    setOptions: React.Dispatch<React.SetStateAction<BeezleDM.DmOption[]>>;
    options: BeezleDM.DmOption[];
    gc: BeezleDM.GroupChat;
}) {
    const fileRef = useRef<HTMLInputElement>();
    const [avatarIcon, setAvatarIcon] = useState(gc?.avatar ?? "");
    const [name, setName] = useState(gc?.name ?? "");

    const UploadImage = async () => {
        const files = fileRef.current!.files as FileList;
        if (files.length < 1) return;
        toast.info("Uploading image/video...");
        const file = files[0];
        const ext = files[0].type;
        const link = await UploadToImgurVideoByFile(file);

        if (!link || link.error) return toast.error("There was an error uploading the image/video!");

        setAvatarIcon(link.data.link);
        toast.success("Successfully uploaded!");
        console.log(link);
    };

    const Edit = async (e) => {
        e.preventDefault();

        let avatar = avatarIcon;
        let _name = name;
        if (avatar.length < 1) {
            // kobeeni :P
            avatar = "https://i.imgur.com/we28gs5.jpeg";
        }

        if (_name.length < 1) _name = "The Honey Gatherers";

        const res = await axios.patch(
            `${api_uri}/api/dms/edit_gc`,
            {
                avatar,
                name: _name,
                group_id: gc.group_id,
            },
            GetFullAuth(),
        );
        console.log(res.data);

        if (res.data?.error) {
            toast.error(`Server threw back an error: ${res.data.error}`);
        } else {
            toast.success(`Group chat edited successfully. Please refresh.`);
        }
    };

    return (
        <form onSubmit={Edit}>
            <label>Group Chat Icon</label>
            <div style={{ backgroundImage: `url(${avatarIcon})` }} onClick={() => fileRef.current!.click()} className="creator-gc-icon">
                <p>Click to change</p>
            </div>
            <input onChange={UploadImage} accept=".jpeg,.gif,.png,.jpg" ref={fileRef} type="file" style={{ display: "none" }} />
            <br />
            <label>Group Chat Name</label>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%" }}
                className="input-field"
                placeholder="Group Chat's Name"
            />
            <button className="button-field">
                <i className="fa-solid fa-pencil" /> Edit Group Chat
            </button>
        </form>
    );
}

export default DmEditGC;
