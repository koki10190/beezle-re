import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate, GetUserPrivate } from "../../../functions/fetchUserPrivate";
import { UserPrivate } from "../../../types/User";
import { Post } from "../../../types/Post";
import { FetchPost } from "../../../functions/FetchPost";
import "./Details.css";
import Divider from "../../../Components/Divider";
import { api_uri } from "../../../links";
import axios, { AxiosError } from "axios";
import GetAuthToken from "../../../functions/GetAuthHeader";
import { toast } from "react-toastify";

interface Props {
    user: UserPrivate;
}

function API({ user }: Props) {
    const [show, setShow] = useState(false);
    const [is_bot, setIsBot] = useState(user?.is_bot);
    const statePassRef = useRef<HTMLParagraphElement>(null);

    const BotButtonInteraction = async () => {
        const res = await axios
            .patch(
                `${api_uri}/api/user/set_bot`,
                {
                    is_bot: !is_bot,
                },
                {
                    headers: GetAuthToken(),
                },
            )
            .catch((err: AxiosError) => {
                toast.error(`Error! ${err.message}`);
            });

        setIsBot((old) => !old);
    };

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>Token</h1>
                <Divider />
                <button className="button-field" onClick={() => setShow(!show)}>
                    {show ? "Hide Token" : "Show Token"}
                </button>
                {show ? (
                    <>
                        <h4>{localStorage.getItem("access_token")}</h4>
                        <p style={{ marginTop: "-15px", color: "#ffffffa0" }}>DO NOT Share this token with anyone!</p>
                    </>
                ) : (
                    ""
                )}
                <Divider />
                {is_bot ? (
                    <button onClick={BotButtonInteraction} className="button-field button-field-red">
                        <i className="fa-solid fa-robot" /> Disable Bot Account
                    </button>
                ) : (
                    <button onClick={BotButtonInteraction} className="button-field button-field-blurple">
                        <i className="fa-solid fa-robot" /> Enable Bot Account
                    </button>
                )}
                <Divider />
                <p>
                    Want to make a bot on beezle but you are a dumbass who has no idea how to use the network tab in inspect element? Well good news
                    for you! we have a list of all API calls!
                </p>
                <button onClick={() => (window.location.href = "/api-calls")} className="button-field">
                    <i className="fa-solid fa-code"></i> API Calls
                </button>
            </div>
        </>
    );
}

export default API;
