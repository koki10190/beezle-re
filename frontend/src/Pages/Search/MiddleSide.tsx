import { FormEvent, FormEventHandler, useEffect, useRef, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate } from "../../types/User";
import { Post } from "../../types/Post";
import { FetchPost } from "../../functions/FetchPost";
import { api_uri } from "../../links";
import axios from "axios";
import { toast } from "react-toastify";
import GetFullAuth from "../../functions/GetFullAuth";

function MiddleSide() {
    const [posts, setPosts] = useState<Array<Post>>([]);
    const [self_user, setSelfUser] = useState<UserPrivate>();
    const textareaRef = useRef<HTMLTextAreaElement>();

    useEffect(() => {
        (async () => {
            const user = GetUserPrivate() as UserPrivate;
            setSelfUser(user);
        })();
    }, []);

    const Search = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const search_res = await axios.get(`${api_uri}/api/post/search?search=${textareaRef.current.value.replace('"', "")}`, GetFullAuth());

        if (search_res.data.error) {
            toast.error(search_res.data.error);
        } else {
            setPosts(search_res.data.posts);
        }
    };

    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-magnifying-glass"></i> Search Posts
            </h1>
            <Divider />
            <form onSubmit={Search}>
                <textarea placeholder="Handle, content or Post ID" className="input-field fixed-100" ref={textareaRef} required></textarea>
                <button
                    style={{
                        marginTop: "10px",
                    }}
                    className="button-field fixed-100"
                >
                    <i className="fa-solid fa-magnifying-glass"></i> Search
                </button>
            </form>
            <Divider />

            {self_user ? (
                <>
                    {posts.length === 0
                        ? "No posts found :("
                        : posts.map((post: Post) => {
                              return (
                                  <PostBox
                                      delete_post_on_bookmark_remove={true}
                                      setPosts={setPosts}
                                      self_user={self_user}
                                      key={post.post_id}
                                      post={post}
                                  />
                              );
                          })}
                </>
            ) : (
                ""
            )}
        </div>
    );
}

export default MiddleSide;
