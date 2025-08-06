import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate, GetUserPrivate } from "../../../functions/fetchUserPrivate";
import { UserPrivate } from "../../../types/User";
import { Post } from "../../../types/Post";
import { FetchPost } from "../../../functions/FetchPost";
import "./Details.css";
import Divider from "../../../Components/Divider";
import { api_uri, discord_auth_uri } from "../../../links";
import axios from "axios";
import PopupToSteamAuth from "../../../functions/RedirectToSteamAuth";
import { toast } from "react-toastify";
import "./Connections.css";

interface Props {
    user: UserPrivate;
}

function PostPreferences({ user }: Props) {
    const [postPref, setPostPref] = useState<PostPreferences>(
        JSON.parse(localStorage.getItem("post_preferences")) ?? {
            right_now: {
                show_reposts: true,
            },
            exclude_posts_with_keywords: [],
            favour_posts_with_keywords: [],
        },
    );

    const SaveChanges = () => {
        localStorage.setItem("post_preferences", JSON.stringify(postPref));
        toast.success("Changes have been saved");
    };

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>
                    <i className="fa-solid fa-comment" /> Post Preferences
                </h1>
                <Divider />
                <div>
                    <label htmlFor="post-pref-show-reposts">Show Reposts in Right Now</label>
                    <input
                        defaultChecked={postPref.right_now.show_reposts}
                        onChange={() =>
                            setPostPref((old) => {
                                const _new = { ...old };
                                _new.right_now.show_reposts = !_new.right_now.show_reposts;
                                return _new;
                            })
                        }
                        id="post-pref-show-reposts"
                        style={{ marginLeft: "10px", display: "inline" }}
                        className="input-checkbox"
                        type="checkbox"
                    />
                </div>
                {/* <Divider />
                <div>
                    <p>Favour Posts with Keywords (Separate keyword by a comma)</p>
                    <input
                        style={{ width: "100%" }}
                        value={postPref.favour_posts_with_keywords}
                        onChange={(e) =>
                            setPostPref((old) => {
                                const _new = { ...old };
                                _new.favour_posts_with_keywords = e.target.value;
                                return _new;
                            })
                        }
                        className="input-field"
                        type="text"
                        placeholder="Separate each keyword by a comma"
                    />
                </div> */}
                <div>
                    <p>Exclude Posts with Keywords (Separate keyword by a comma)</p>
                    <input
                        style={{ width: "100%" }}
                        value={postPref.exclude_posts_with_keywords}
                        onChange={(e) =>
                            setPostPref((old) => {
                                const _new = { ...old };
                                _new.exclude_posts_with_keywords = e.target.value;
                                return _new;
                            })
                        }
                        className="input-field"
                        type="text"
                        placeholder="Separate each keyword by a comma"
                    />
                </div>
                <button onClick={SaveChanges} style={{ marginTop: "15px" }} className="button-field">
                    Save Changes
                </button>
            </div>
        </>
    );
}

export default PostPreferences;
