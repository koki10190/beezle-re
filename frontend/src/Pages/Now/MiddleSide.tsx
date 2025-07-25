import axios, { all } from "axios";
import { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import PostTyper from "../../Components/PostTyper";
import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { RefreshPosts } from "../../functions/RefreshPosts";
import GetPostPrefsStringQuery from "../../functions/GetPostPrefsStringQuery";
import GetFullAuth from "../../functions/GetFullAuth";
import { toast } from "react-toastify";

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
    const [self_user, setSelfUser] = useState<UserPrivate>();
    const [postOffset, setPostOffset] = useState(0);

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target! as HTMLDivElement;
        if (!(element.scrollHeight - element.scrollTop === element.clientHeight)) return;

        // detected bottom

        console.log("at bottom!");
        if (self_user?.is_bot) return console.error("Bot Accounts are not allowed to use the site.");
        const posts = (await axios.get(`${api_uri}/api/post/get/now?offset=${postOffset}&${GetPostPrefsStringQuery()}`, GetFullAuth())).data;
        setPosts((old) => [...old, ...posts.posts]);
        setPostOffset(posts.offset);
    };

    useEffect(() => {
        (async () => {
            const m_user = await fetchUserPrivate();
            setSelfUser(m_user);
            if (m_user?.is_bot) return console.error("Bot Accounts are not allowed to use the site.");
            const posts = (await axios.get(`${api_uri}/api/post/get/now?offset=${postOffset}&${GetPostPrefsStringQuery()}`, GetFullAuth())).data;
            setPosts(posts.posts);
            setPostOffset(posts.offset);
        })();
    }, []);

    const OnTyperSend = (data: Post) => {
        setPosts((old) => [data, ...old]);
    };

    return (
        <div onScroll={handleScroll} className="page-sides side-middle home-middle">
            <PostTyper onSend={OnTyperSend} />
            <Divider />
            <p>You're viewing Right Now</p>
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
