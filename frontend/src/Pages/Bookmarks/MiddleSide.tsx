import { useEffect, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate } from "../../types/User";
import { Post } from "../../types/Post";
import FetchPost from "../../functions/FetchPost";

function MiddleSide() {
    const [posts, setPosts] = useState<Array<Post>>([]);
    const [self_user, setSelfUser] = useState<UserPrivate>();

    useEffect(() => {
        (async () => {
            const user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(user);

            console.log("foreach");
            user.bookmarks.forEach(async (post_id: string) => {
                console.log(post_id);
                const post = await FetchPost(post_id);
                setPosts(old => [...old, post]);
            });
        })();
    }, []);
    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-bookmark"></i> Bookmarks
            </h1>
            <Divider />
            {self_user
                ? posts.map((post: Post) => {
                      return (
                          <PostBox
                              delete_post_on_bookmark_remove={true}
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
