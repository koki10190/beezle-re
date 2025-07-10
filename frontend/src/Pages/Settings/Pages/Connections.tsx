import { useEffect, useRef, useState } from "react";

import { fetchUserPrivate } from "../../../functions/fetchUserPrivate";
import { UserPrivate } from "../../../types/User";
import { Post } from "../../../types/Post";
import FetchPost from "../../../functions/FetchPost";
import "./Details.css";
import Divider from "../../../Components/Divider";
import { api_uri } from "../../../links";
import axios from "axios";
import PopupToSteamAuth from "../../../functions/RedirectToSteamAuth";
import { toast } from "react-toastify";

interface Props {
    user: UserPrivate;
}

function Connections({ user }: Props) {
    const [password, setPassword] = useState("");
    const [steam_connected, setSteamConnected] = useState(user.connections?.steam?.id ? true : false);
    const [spotify_connected, setSpotifyConnected] = useState(user.connections?.spotify?.access_token ? true : false);
    const statePassRef = useRef<HTMLParagraphElement>(null);

    const SpotifyAuth = () => {
        const endpoint = "https://accounts.spotify.com/authorize";
        const redirectURI = `${api_uri}/`;
        const clientID = "29d3f659c14a45d684a030365c9e4afb";

        const scopes = ["user-read-currently-playing"];

        const loginURL = `${endpoint}?client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scopes.join(
            "%20",
        )}&response_type=code&show_dialog=true`;

        window.location.href = loginURL;
    };

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>Connections</h1>
                <Divider />
                {steam_connected ? (
                    <>
                        <p>
                            <i className="fa-brands fa-steam"></i> {user.connections.steam.id}
                        </p>
                        <button
                            onClick={async () => {
                                const res = await axios.post(`${api_uri}/api/connections/steam_disconnect`, {
                                    token: localStorage.getItem("access_token"),
                                });

                                toast.success(res.data);
                                setSteamConnected(false);
                            }}
                            className="button-field button-field-red"
                        >
                            <i className="fa-brands fa-steam"></i> Disconnect Steam
                        </button>
                    </>
                ) : (
                    <button onClick={() => PopupToSteamAuth(`${window.location.origin}/connect/steam`)} className="button-field button-field-blue">
                        <i className="fa-brands fa-steam"></i> Connect Steam
                    </button>
                )}

                <Divider />

                {spotify_connected ? (
                    <></>
                ) : (
                    <button onClick={SpotifyAuth} className="button-field button-field-green">
                        <i className="fa-brands fa-spotify"></i> Connect Spotify
                    </button>
                )}

                <p ref={statePassRef}></p>
            </div>
        </>
    );
}

export default Connections;
