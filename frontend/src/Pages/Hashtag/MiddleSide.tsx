import axios, { all } from "axios";
import { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import PostTyper from "../../Components/PostTyper";
import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { RefreshPosts } from "../../functions/RefreshPosts";

function MiddleSide() {
    const { hashtag } = useParams();
    // const [self_user, setSelfUser] = useState<UserPrivate | null>(null);
    const [posts, setPosts] = useState<Array<Post>>([]);
    const [self_user, setSelfUser] = useState<UserPrivate>();
    const [postOffset, setPostOffset] = useState(0);

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target! as HTMLDivElement;
        if (!(element.scrollHeight - element.scrollTop === element.clientHeight)) return;

        // detected bottom

        console.log("at bottom!");
        const posts = (await axios.get(`${api_uri}/api/post/hashtag/get?offset=${postOffset}&hashtag=${hashtag}`)).data;
        setPosts((old) => [...old, ...posts.posts]);
        setPostOffset(posts.offset);
    };

    useEffect(() => {
        (async () => {
            const m_user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(m_user);
            const posts = (await axios.get(`${api_uri}/api/post/hashtag/get?offset=${postOffset}&hashtag=${hashtag}`)).data;
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
            <p>
                You're viewing <span className="mention">#{hashtag}</span> posts
            </p>
            {self_user
                ? posts.length < 1
                    ? "I hear crickets... 🦗"
                    : posts.map((post: Post) => {
                          return <PostBox allow_reply_attribute={true} setPosts={setPosts} self_user={self_user} key={post.post_id} post={post} />;
                      })
                : ""}
        </div>
    );
}

export default MiddleSide;
