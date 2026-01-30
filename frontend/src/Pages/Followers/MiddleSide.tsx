import { useEffect, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { FetchPost } from "../../functions/FetchPost";
import FollowBox from "../../Components/FollowBox";
import { useParams } from "react-router";
import { fetchUserPublic } from "../../functions/fetchUserPublic";

function MiddleSide() {
    const { handle } = useParams();
    const [posts, setPosts] = useState<Array<Post>>([]);
    const [self_user, setSelfUser] = useState<UserPrivate>();
    const [user, setUser] = useState<UserPublic>();

    useEffect(() => {
        (async () => {
            const user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(user);
            setUser((await fetchUserPublic(handle)) as UserPublic);

            console.log("foreach");
            user.bookmarks.forEach(async (post_id: string) => {
                console.log(post_id);
                const post = await FetchPost(post_id);
                setPosts((old) => [...old, post]);
            });
        })();
    }, []);
    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-users"></i> Followers
            </h1>
            <p style={{ marginTop: "-15px" }}>@{user?.handle}</p>
            <Divider />
            {self_user && user
                ? user.followers.map((follower: string) => {
                      return <FollowBox self_user={self_user} handle={follower} />;
                  })
                : ""}
        </div>
    );
}

export default MiddleSide;
