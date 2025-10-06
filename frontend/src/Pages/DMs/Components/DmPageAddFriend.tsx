import axios from "axios";

import ReactDOMServer from "react-dom/server";
import React, { useEffect, useRef, useState, UIEvent, forwardRef } from "react";
import Divider from "../../../Components/Divider";
import { fetchUserPublic } from "../../../functions/fetchUserPublic";
import { toast } from "react-toastify";
import { UserPrivate } from "../../../types/User";
import { fetchUserPrivate } from "../../../functions/fetchUserPrivate";
import { api_uri } from "../../../links";
import GetFullAuth from "../../../functions/GetFullAuth";

function DmPageAddFriend({ setOptions }: { setOptions: React.Dispatch<React.SetStateAction<BeezleDM.DmOption[]>> }) {
    const inputRef = useRef<HTMLInputElement>();
    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);

    useEffect(() => {
        (async () => {
            if (localStorage.getItem("access_token")) {
                setSelfUser(await fetchUserPrivate());
            }
        })();
    }, []);

    const OnSubmit = async (e) => {
        const value = inputRef.current.value as string;
        if (value.trim().length < 1) return;

        e.preventDefault();

        const user = await fetchUserPublic(value);

        if (!user) {
            toast.error("Couldn't find an user with the handle \"" + value + '"');
        }

        console.log(user);
        if (!user.following.find((x) => x === self_user?.handle)) {
            toast.error(`Cannot add ${user.username} as a friend, you're not mutuals with them!`);
            return;
        }

        const option: BeezleDM.DmOption = {
            is_group: false,
            user_handle: value,
            selection_id: "",
        };

        setOptions((old) => [...old, option]);

        const db_option = await axios.post(`${api_uri}/api/dms/create_selection`, option, GetFullAuth());
        if (db_option.data?.message) {
            console.log(db_option.data);
        }
    };

    return (
        <form onSubmit={OnSubmit}>
            <Divider />
            <h1>
                <i className="fa-solid fa-user"></i> Add a Friend
            </h1>
            <Divider />
            <label>Mutual's Handle</label>
            <input ref={inputRef} style={{ width: "100%" }} className="input-field" placeholder="User's Handle" />
            <button className="button-field">
                <i className="fa-solid fa-user-plus"></i> Add Friend
            </button>
        </form>
    );
}

export default DmPageAddFriend;
