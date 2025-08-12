import axios, { all } from "axios";
import { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import PostTyper from "../../Components/PostTyper";
import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { RefreshPosts } from "../../functions/RefreshPosts";
import GetFullAuth from "../../functions/GetFullAuth";
import { toast } from "react-toastify";
import { EnumToPageAPI, EnumToPageName, PostPageEnum } from "../../types/PageEnum";
import GetAuthToken from "../../functions/GetAuthHeader";
import Preloader from "../../Components/Preloader";

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
    const [page, setPage] = useState<PostPageEnum>(PostPageEnum.Home);
    const [pageURI, setPageURI] = useState(EnumToPageAPI(PostPageEnum.Home));
    const [pageText, setPageText] = useState(EnumToPageName(PostPageEnum.Home));
    const [loading, setLoading] = useState(false);
    const [fetchingPosts, setFetchingPosts] = useState(false);

    const FetchPosts = async (offset: number, user: UserPrivate) => {
        if (!user) return;
        let body = {
            offset,
            filter_users: user.following,
        };

        if (page !== PostPageEnum.Home) delete body.filter_users;

        if (offset < 1) {
            setLoading(true);
            setPosts([]);
        }

        try {
            const posts = (await axios.post(`${api_uri}${pageURI}`, body, GetFullAuth())).data;
            setPosts((old) => {
                if (offset > 0) return [...old, ...posts.posts];

                return posts.posts;
            });
            setPostOffset(posts.offset);
        } catch (e) {
            console.log(e);
            const posts = (
                await axios.get(`${api_uri}${pageURI}`, {
                    params: body,
                    headers: GetAuthToken(),
                })
            ).data;
            setPosts((old) => {
                if (offset > 0) return [...old, ...posts.posts];

                return posts.posts;
            });
            console.log(posts);
            setPostOffset(posts.offset);
        }

        setLoading(false);
    };

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target! as HTMLDivElement;
        if (!(element.scrollHeight - element.scrollTop === element.clientHeight)) return;

        // detected bottom

        console.log("at bottom!");
        setLoading(true);
        if (self_user?.is_bot) return console.error("Bot accounts cannot use the site.");
        FetchPosts(postOffset, self_user);
        setLoading(false);
    };

    useEffect(() => {
        (async () => {
            const m_user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(m_user);
            if (m_user.is_bot) return toast.error("Bot accounts cannot use the site!");
            FetchPosts(0, m_user);
        })();
    }, []);

    useEffect(() => {
        const uri = EnumToPageAPI(page);
        console.log(uri);
        setPageURI(uri);
        setPageText(EnumToPageName(page));
    }, [page]);

    useEffect(() => {
        FetchPosts(0, self_user);
    }, [pageURI]);

    const OnTyperSend = (data: Post) => {
        setPosts((old) => [data, ...old]);
    };

    return (
        <div onScroll={handleScroll} className="page-sides side-middle home-middle">
            <PostTyper onSend={OnTyperSend} />
            <Divider full_page={true} />
            <div className="hive-page-post-seperators grid-template-3">
                <div
                    onClick={() => {
                        setPage(PostPageEnum.Home);
                    }}
                    className="hive-page-post-selector"
                >
                    <p>
                        <i className="fa-solid fa-home" /> Home
                    </p>
                </div>
                <div
                    onClick={() => {
                        setPage(PostPageEnum.RightNow);
                    }}
                    className="hive-page-post-selector"
                >
                    <p>
                        <i className="fa-solid fa-sparkles" /> Right Now
                    </p>
                </div>
                <div
                    onClick={() => {
                        setPage(PostPageEnum.Explore);
                    }}
                    className="hive-page-post-selector"
                >
                    <p>
                        <i className="fa-solid fa-globe" /> Explore
                    </p>
                </div>
            </div>
            <p>
                You're viewing {pageText} -{" "}
                <span onClick={() => FetchPosts(0, self_user)} className="text-btn">
                    <i className="fa-solid fa-repeat" /> Reload Posts
                </span>
            </p>
            {self_user?.is_bot ? <p>Bot Accounts are not allowed to use the site.</p> : ""}
            {self_user
                ? posts.map((post: Post) => {
                      return <PostBox allow_reply_attribute={true} setPosts={setPosts} self_user={self_user} key={post.post_id} post={post} />;
                  })
                : ""}
            {loading ? <Preloader /> : ""}
        </div>
    );
}

export default MiddleSide;
