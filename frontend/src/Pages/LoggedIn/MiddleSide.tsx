import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";

import "./ScopeLoggedIn.css";
import PostTyper from "../../Components/PostTyper";
import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { RefreshPosts } from "../../functions/RefreshPosts";

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

    useEffect(() => {
        (async () => {
            setPosts((await axios.get(`${api_uri}/api/post/get/explore`)).data);
            setSelfUser((await fetchUserPrivate()) as UserPrivate);
        })();
    }, []);

    const OnTyperSend = (data: Post) => {
        setPosts(old => [data, ...old]);
    };

    return (
        <div className="page-sides side-middle home-middle">
            <PostTyper onSend={OnTyperSend} />
            <Divider />
            {self_user
                ? posts.map((post: Post) => {
                      return (
                          <PostBox
                              allow_reply_attribute={true}
                              setPosts={setPosts}
                              self_user={self_user}
                              key={post.post_id}
                              post={post}
                          />
                      );
                  })
                : ""}
        </div>
    );
}

export default MiddleSide;
