import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate } from "../../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../../types/User";
import { Post } from "../../../types/Post";
import FetchPost from "../../../functions/FetchPost";
import Divider from "../../../Components/Divider";
import { api_uri } from "../../../links";
import axios from "axios";
import { ReportType } from "../../../types/Report";
import { fetchUserPublic } from "../../../functions/fetchUserPublic";
import { toast } from "react-toastify";
import GetAuthToken from "../../../functions/GetAuthHeader";
interface Props {
    user: UserPrivate;
}

function DeletePost({ user }: Props) {
    const [PostID, setPostID] = useState("");

    const _DeletePost = async () => {
        const res = await axios.post(
            `${api_uri}/api/post/mod_delete`,
            {
                post_id: PostID,
            },
            {
                headers: GetAuthToken(),
            },
        );

        if (res.data.error) toast.error(res.data.error);
        else toast.success(res.data.message);

        setPostID("");
    };

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>
                    <i className="fa-solid fa-trash" /> Delete Post
                </h1>
                <Divider />
                <input value={PostID} onChange={(e: any) => setPostID(e.target.value)} className="input-field fixed-100" placeholder="Post ID" />
                <button onClick={_DeletePost} className="button-field button-field-red">
                    Delete Post
                </button>
            </div>
        </>
    );
}

export default DeletePost;
