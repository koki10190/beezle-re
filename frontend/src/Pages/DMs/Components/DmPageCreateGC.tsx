import axios from "axios";

import ReactDOMServer from "react-dom/server";
import React, { useEffect, useRef, useState, UIEvent, forwardRef } from "react";
import Divider from "../../../Components/Divider";
import "./DmPageCreateGC.css";
import UploadToImgurVideoByFile from "../../../functions/UploadToImgurVideoByFile";
import { toast } from "react-toastify";
import { api_uri } from "../../../links";
import GetFullAuth from "../../../functions/GetFullAuth";

function DmPageCreateGC({
    setOptions,
    options,
}: {
    setOptions: React.Dispatch<React.SetStateAction<BeezleDM.DmOption[]>>;
    options: BeezleDM.DmOption[];
}) {
    const fileRef = useRef<HTMLInputElement>();
    const [avatarIcon, setAvatarIcon] = useState("");
    const [name, setName] = useState("");
    const [members, setMembers] = useState("");

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

    const Create = async (e) => {
        e.preventDefault();

        let avatar = avatarIcon;
        let _name = name;
        let _members = members;
        if (avatar.length < 1) {
            // kobeeni :P
            avatar = "https://i.imgur.com/we28gs5.jpeg";
        }

        if (_name.length < 1) _name = "The Honey Gatherers";

        const res = await axios.post(
            `${api_uri}/api/dms/create_gc`,
            {
                avatar,
                name: _name,
                members: _members, // eg: "koki, beezle, poww"
            },
            GetFullAuth(),
        );
        console.log(res.data);

        if (res.data?.error) {
            toast.error(`Server threw back an error: ${res.data.error}`);
        } else {
            toast.success(`Group chat created successfully.`);
        }
    };

    return (
        <form onSubmit={Create}>
            <Divider />
            <h1>
                <i className="fa-solid fa-users"></i> Create a Group Chat
            </h1>
            <Divider />
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
            <label>Members (Mutuals handles only, separate by comma. Eg: koki, beezle, poww)</label>
            <input
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                style={{ width: "100%" }}
                className="input-field"
                placeholder="koki, beezle, poww"
            />
            <button className="button-field">
                <i className="fa-solid fa-plus" /> Create Group Chat
            </button>
        </form>
    );
}

export default DmPageCreateGC;
