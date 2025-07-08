import { useEffect, useState } from 'react';
import { checkToken } from '../../functions/checkToken';

import Divider from '../../Components/Divider';
import PostBox from '../../Components/PostBox';
import { fetchUserPrivate } from '../../functions/fetchUserPrivate';
import { UserPrivate } from '../../types/User';
import { Post } from '../../types/Post';
import FetchPost from '../../functions/FetchPost';
import { NotificationData } from '../../types/Notification';
import { fetchUserPublic } from '../../functions/fetchUserPublic';
import NotifBox from '../../Components/NotifBox';
import './Notifications.css';
import axios from 'axios';
import { api_uri } from '../../links';
import { toast } from 'react-toastify';

function MiddleSide() {
    const [Notifs, setNotifs] = useState<Array<NotificationData>>([]);

    const ClearNotifs = async () => {
        setNotifs([]);
        const res = (
            await axios.post(`${api_uri}/api/user/clear_notifs`, {
                token: localStorage.getItem('access_token'),
            })
        ).data as { error: string | null; changed: boolean };

        if (res.error) toast.error(res.error);
        else toast.success('Cleared Notifications');
    };

    useEffect(() => {
        (async () => {
            let notifs = (await fetchUserPrivate())!.notifications as Array<NotificationData>;

            notifs.forEach((notif: NotificationData) => {
                (async () => {
                    notif.react_key_prop_id = Math.random().toString();
                })();
            });
            notifs.reverse();

            setNotifs(notifs);
        })();
    }, []);
    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-bookmark"></i> Notifications
            </h1>
            <Divider />
            <a onClick={ClearNotifs} className="notif-clear">
                <i className="fa-solid fa-broom-wide"></i> Clear Notifications
            </a>
            <Divider />
            {Notifs.map((notif: NotificationData) => {
                return <NotifBox key={notif.react_key_prop_id} notif={notif} />;
            })}
        </div>
    );
}

export default MiddleSide;
