import axios from "axios";
import { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";

import "./ScopeLoggedIn.css";
import PostTyper from "../../Components/PostTyper";
import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { RefreshPosts } from "../../functions/RefreshPosts";
import GetPostPrefsStringQuery from "../../functions/GetPostPrefsStringQuery";
import GetFullAuth from "../../functions/GetFullAuth";

function MiddleSide() {
    const data: {
        username: string;
        handle: string;
        date: Date;
        content: string;
    } = {
        username: "aasdkjfdjdskfjag",
        handle: "adasdasd",
        date: new Date(),
        content: "lorem!",
    };
    // const [self_user, setSelfUser] = useState<UserPrivate | null>(null);
    const [posts, setPosts] = useState<Array<Post>>([]);
    const [offset, setOffset] = useState(0);
    const [self_user, setSelfUser] = useState<UserPrivate>();

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target! as HTMLDivElement;
        if (!(element.scrollHeight - element.scrollTop === element.clientHeight)) return;

        // detected bottom

        console.log("at bottom!");

        if (self_user?.is_bot) return console.error("Bot accounts cannot use the site.");
        const data = (await axios.get(`${api_uri}/api/post/get/explore?offset=${offset}&${GetPostPrefsStringQuery()}`, GetFullAuth())).data;

        setPosts((old) => [...old, ...(data.posts as Array<Post>)]);

        setOffset(data.offset as number);
        // setAllPosts(old => {})
    };

    useEffect(() => {
        (async () => {
            const data = (await axios.get(`${api_uri}/api/post/get/explore?offset=${offset}&${GetPostPrefsStringQuery()}`, GetFullAuth())).data;
            setPosts(data.posts as Array<Post>);
            setOffset(data.offset as number);
            console.log("EXPLORE:", data);
            setSelfUser(GetUserPrivate() as UserPrivate);
        })();
    }, []);

    const OnTyperSend = (data: Post) => {
        setPosts((old) => [data, ...old]);
    };

    return (
        <div onScroll={handleScroll} className="page-sides side-middle home-middle">
            <PostTyper onSend={OnTyperSend} />
            <Divider />
            <p>You're viewing Explore</p>
            {self_user?.is_bot ? <p>Bot Accounts are not allowed to use the site.</p> : ""}

            {self_user
                ? posts.map((post: Post) => {
                      return <PostBox allow_reply_attribute={true} setPosts={setPosts} self_user={self_user} key={post.post_id} post={post} />;
                  })
                : ""}
        </div>
    );
}

export default MiddleSide;
