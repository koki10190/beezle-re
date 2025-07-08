import { useEffect, useRef, useState } from 'react';

import { fetchUserPrivate } from '../../../functions/fetchUserPrivate';
import { UserPrivate } from '../../../types/User';
import { Post } from '../../../types/Post';
import FetchPost from '../../../functions/FetchPost';
import './Details.css';
import Divider from '../../../Components/Divider';
import { api_uri } from '../../../links';
import axios from 'axios';
import PopupToSteamAuth from '../../../functions/RedirectToSteamAuth';
import { toast } from 'react-toastify';

interface Props {
    user: UserPrivate;
}

function Connections({ user }: Props) {
    const [password, setPassword] = useState('');
    const [steam_connected, setSteamConnected] = useState(user.connections?.steam?.id ? true : false);
    const statePassRef = useRef<HTMLParagraphElement>(null);

    const ChangePassword = async () => {
        const res = await axios.post(`${api_uri}/api/user/change_password`, {
            token: localStorage.getItem('access_token'),
            password,
        });

        statePassRef.current!.innerText = res.data.error ? res.data.error : res.data.message;

        if (res.data.error) toast.error(res.data.error);
        else toast.success(res.data.message);

        window.location.href = '/logout';
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
                                    token: localStorage.getItem('access_token'),
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
                <p ref={statePassRef}></p>
            </div>
        </>
    );
}

export default Connections;
