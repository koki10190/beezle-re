import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri, discord, github, twitter, youtube } from "../../links";
import { checkToken } from "../../functions/checkToken";
import FollowBox from "../../Components/FollowBox";
import { UserPrivate, UserPublic } from "../../types/User";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import DMUser from "./DMUser";
import "./DMUser.css";

function LeftSide({ setDMUser }: { setDMUser: any }) {
    const [self, setSelf] = useState<UserPrivate>();
    const [mutuals, setMutuals] = useState<Array<UserPublic>>([]);

    useEffect(() => {
        (async () => {
            const self = await fetchUserPrivate();
            if (!self) return (window.location.href = "/");

            self.following.forEach(async following => {
                self.followers.forEach(async follower => {
                    if (following == follower) {
                        const user = await fetchUserPublic(follower);
                        setMutuals(old => {
                            return [...old, user];
                        });
                    }
                });
            });
        })();
    }, []);

    return (
        <div className="page-sides side-left">
            <br></br>
            {mutuals.map(mutual => {
                return <DMUser key={mutual.handle} setDMUser={setDMUser} user={mutual} />;
            })}
        </div>
    );
}

export default LeftSide;
