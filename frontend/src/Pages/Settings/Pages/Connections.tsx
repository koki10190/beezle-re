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
    const [lastfm_connected, setLastfmConnected] = useState(user.connections?.lastfm?.username ? true : false);
    const lastfm_username = useRef<HTMLInputElement>();
    const statePassRef = useRef<HTMLParagraphElement>(null);

    const SpotifyAuth = () => {
        const endpoint = "https://accounts.spotify.com/authorize";
        const redirectURI = window.location.origin + "/spotify-auth";
        const clientID = "29d3f659c14a45d684a030365c9e4afb";

        const scopes = ["user-read-currently-playing"];

        const loginURL = `${endpoint}?client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scopes.join(
            "%20",
        )}&response_type=code&show_dialog=true`;

        window.location.href = loginURL;
    };

    const ConnectLastFM = async (e: React.FormEvent) => {
        e.preventDefault();

        const username = lastfm_username.current.value;
        if (username === "") return;

        const res = await axios.post(`${api_uri}/api/lastfm/set_username`, {
            token: localStorage.getItem("access_token"),
            username,
        });

        toast.success(res.data);
        setTimeout(() => {
            window.location.reload();
        }, 750);
    };

    return (
        <>
            <div className="page-sides side-middle home-middle">
                <h1>Connections</h1>
                <Divider />
                {steam_connected ? (
                    <>
                        <p>
                            <i className="fa-brands fa-steam"></i> Steam ID: {user.connections.steam.id}
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
                    <>
                        <p>
                            <i className="fa-brands fa-spotify"></i> Spotify Connected
                        </p>
                        <button
                            onClick={async () => {
                                const res = await axios.post(`${api_uri}/api/connections/spotify_disconnect`, {
                                    token: localStorage.getItem("access_token"),
                                });

                                toast.success(res.data);
                                setSpotifyConnected(false);
                            }}
                            className="button-field button-field-red"
                        >
                            <i className="fa-brands fa-spotify"></i> Disconnect Spotify
                        </button>
                    </>
                ) : (
                    <button onClick={SpotifyAuth} className="button-field button-field-green">
                        <i className="fa-brands fa-spotify"></i> Connect Spotify
                    </button>
                )}
                <Divider />
                {lastfm_connected ? (
                    <>
                        <p>
                            <i className="fa-brands fa-lastfm"></i> last.fm: {user.connections.lastfm.username}
                        </p>
                        <button
                            onClick={async () => {
                                const res = await axios.post(`${api_uri}/api/lastfm/remove_username`, {
                                    token: localStorage.getItem("access_token"),
                                });

                                toast.success(res.data);
                                setLastfmConnected(false);
                            }}
                            className="button-field button-field-red"
                        >
                            <i className="fa-brands fa-lastfm"></i> Disconnect last.fm
                        </button>
                    </>
                ) : (
                    <>
                        <form className="lastfm-connection-form" onSubmit={ConnectLastFM}>
                            <input style={{ width: "100%" }} className="input-field" ref={lastfm_username} placeholder="last.fm username" />
                            <button className="button-field button-field-blurple">
                                <i className="fa-brands fa-lastfm"></i> Connect last.fm
                            </button>
                        </form>
                    </>
                )}

                <p ref={statePassRef}></p>
            </div>
        </>
    );
}

export default Connections;
