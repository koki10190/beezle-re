import axios, { all } from "axios";
import { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect, useNavigate, useParams } from "react-router-dom";
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
import GetAuthToken from "../../functions/GetAuthHeader";
import "./MiddleSide.css";
import FollowBox from "../../Components/FollowBox";

const POST_SELECTION = {
    RightNow: "/api/hives/posts/now",
    Explore: "/api/hives/posts/explore",
};

function MiddleSide() {
    const navigate = useNavigate();
    const { handle } = useParams();

    const [hive, setHive] = useState<BeezleHives.Hive>();
    const [memberCount, setMemberCount] = useState(0);
    const [posts, setPosts] = useState<Array<Post>>([]);
    const [self, setSelf] = useState<UserPrivate>();
    const [isMember, setIsMember] = useState(false);
    const [postOffset, setPostOffset] = useState(0);
    const [postUri, setPostUri] = useState(POST_SELECTION.RightNow);

    const FetchAndSet = async (hive: BeezleHives.Hive, postOffset: number, override: boolean = false) => {
        const posts = (
            await axios.get(`${api_uri}${postUri}`, {
                params: {
                    offset: postOffset,
                    hive_id: hive.hive_id,
                },
                headers: GetAuthToken(),
            })
        ).data;
        console.log(posts);

        setPosts((old) => {
            return override ? posts.posts : [...old, ...posts.posts];
        });
        setPostOffset(posts.offset);
    };

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target! as HTMLDivElement;
        if (!(element.scrollHeight - element.scrollTop === element.clientHeight)) return;

        // detected bottom

        console.log("at bottom!");
        if (self?.is_bot) return console.error("Bot Accounts are not allowed to use the site.");
        await FetchAndSet(hive, postOffset);
    };

    const Init = async () => {
        const res = await axios.get(`${api_uri}/api/hives/get`, {
            params: {
                handle,
            },
            headers: GetAuthToken(),
        });

        setHive(res.data.hive);
        setMemberCount(res.data.members);

        const res2 = await axios.get(`${api_uri}/api/hives/is_member`, {
            params: {
                hive_id: res.data.hive.hive_id,
            },
            headers: GetAuthToken(),
        });

        setIsMember(res2.data?.member ?? false);

        setSelf(await fetchUserPrivate());

        await FetchAndSet(res.data.hive, 0);
    };

    useEffect(() => {
        Init();
    }, []);

    const OnPostUriChange = async () => {
        await FetchAndSet(hive, 0, true);
    };
    useEffect(() => {
        OnPostUriChange();
        console.log(postUri);
    }, [postUri]);

    const OnTyperSend = (data: Post) => {
        setPosts((old) => [data, ...old]);
    };

    const JoinOrLeave = async () => {
        const res = await axios.post(
            `${api_uri}/api/hives/join`,
            {
                hive_id: hive.hive_id,
                leave: isMember,
            },
            GetFullAuth(),
        );

        if (res.data.message) {
            toast.success(res.data.message);
        }

        if (res.data.error) {
            toast.error(res.data.error);
            return;
        }

        setIsMember((old) => !old);

        setMemberCount((old) => {
            return isMember ? --old : ++old;
        });
    };

    if (!hive || !self)
        return (
            <div className="page-sides side-middle home-middle">
                <h1>
                    <i className="fa-solid fa-bee"></i> Loading Hive...
                </h1>
            </div>
        );

    return (
        <div className="page-sides side-middle home-middle">
            <div
                style={{
                    backgroundImage: `url(${hive.banner})`,
                }}
                className="hive-page-banner"
            ></div>
            <div
                style={{
                    backgroundImage: `url(${hive.icon})`,
                }}
                className="hive-page-avatar"
            ></div>

            <h2 className="hive-page-username">{hive.name}</h2>
            <p className="hive-page-handle">@{hive.handle}</p>
            <div className="hive-page-sections">
                <div>
                    <h4 className="bee-queen-h5">
                        <i className="fa-solid fa-crown" /> Bee Queen (Owner)
                    </h4>
                    <FollowBox handle={hive.owner} self_user={self} />
                </div>
                <div className="hive-page-section">
                    <div className="hive-page-section-header">
                        <h5>
                            <i className="fa-solid fa-bee" /> Description
                        </h5>
                        <p>{hive.description}</p>
                    </div>
                </div>
                {hive.owner === self.handle ? (
                    <button onClick={() => navigate("/hives/edit/" + hive.hive_id)} style={{ marginTop: "10px" }} className="button-field">
                        Edit Hive
                    </button>
                ) : (
                    ""
                )}
                {hive?.owner !== self?.handle ? (
                    <button
                        style={{ marginTop: "10px" }}
                        onClick={JoinOrLeave}
                        className={`button-field ${isMember ? "button-field-red" : "button-field-green"}`}
                    >
                        {isMember ? "Leave Hive" : "Join Hive"}
                    </button>
                ) : (
                    ""
                )}

                {hive?.owner === self?.handle || hive?.moderators?.findIndex((x) => x === self?.handle) > -1 ? (
                    <button
                        style={{ marginTop: "10px", marginBottom: "-5px" }}
                        onClick={() => navigate(`/hives/dashboard/${hive.hive_id}`)}
                        className="button-field button-field-blurple"
                    >
                        <i className="fa-solid fa-shield-halved" /> Dashboard
                    </button>
                ) : (
                    ""
                )}

                <p>
                    Members: <b>{memberCount}</b>
                </p>
            </div>

            <hr
                style={{
                    width: "calc(100% + 40px)",
                    marginLeft: "-20px",
                    borderTop: "1px solid rgba(255, 255,255, 0.4)",
                }}
                className="divider"
            ></hr>
            {isMember ? (
                <>
                    <PostTyper hive_post={hive.hive_id} onSend={OnTyperSend} />
                    <hr
                        style={{
                            width: "calc(100% + 40px)",
                            marginLeft: "-20px",
                            borderTop: "1px solid rgba(255, 255,255, 0.4)",
                        }}
                        className="divider"
                    ></hr>
                </>
            ) : (
                ""
            )}
            <div className="hive-page-post-seperators">
                <div onClick={() => setPostUri(POST_SELECTION.RightNow)} className="hive-page-post-selector">
                    <p>
                        <i className="fa-solid fa-sparkles" /> Right Now
                    </p>
                </div>
                <div onClick={() => setPostUri(POST_SELECTION.Explore)} className="hive-page-post-selector">
                    <p>
                        <i className="fa-solid fa-globe" /> Explore
                    </p>
                </div>
            </div>

            <div className="hive-page-posts">
                {self
                    ? posts.map((post: Post) => {
                          return (
                              <PostBox
                                  ignore_hive_attrib={true}
                                  allow_reply_attribute={true}
                                  setPosts={setPosts}
                                  self_user={self}
                                  key={post.post_id}
                                  post={post}
                              />
                          );
                      })
                    : ""}
            </div>
        </div>
    );
}

export default MiddleSide;
