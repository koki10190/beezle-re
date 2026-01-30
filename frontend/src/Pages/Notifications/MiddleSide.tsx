import { UIEvent, useEffect, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate } from "../../types/User";
import { Post } from "../../types/Post";
import { FetchPost } from "../../functions/FetchPost";
import { NotificationData } from "../../types/Notification";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import NotifBox from "../../Components/NotifBox";
import "./Notifications.css";
import axios from "axios";
import { api_uri } from "../../links";
import { toast } from "react-toastify";
import GetAuthToken from "../../functions/GetAuthHeader";
import Preloader from "../../Components/Preloader";

const INDEX_MOVER = 15;
function MiddleSide() {
    const [Notifs, setNotifs] = useState<Array<NotificationData>>([]);
    const [cached, setCached] = useState<Array<NotificationData>>([]);
    const [notifIndex, setNotifIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    const ClearNotifs = async () => {
        setNotifs([]);
        setCached([]);
        const res = (await axios.patch(`${api_uri}/api/user/clear_notifs`, {}, { headers: GetAuthToken() })).data as {
            error: string | null;
            changed: boolean;
        };

        if (res.error) toast.error(res.error);
        else toast.success("Cleared Notifications");
    };

    useEffect(() => {
        (async () => {
            setLoading(true);
            let notifs = ((await fetchUserPrivate(localStorage.getItem("access_token")))?.notifications as Array<NotificationData>) ?? [];

            notifs.forEach((notif: NotificationData) => {
                (async () => {
                    notif.react_key_prop_id = Math.random().toString();
                })();
            });
            notifs.reverse();
            setNotifs(notifs);
            setCached((old) => {
                const _new = [...old];
                if (notifs.length <= 0) return _new;
                for (let i = 0; i < INDEX_MOVER && i < notifs.length; i++) {
                    let pusher = notifs[i];
                    pusher.react_key_prop_id = Math.random().toString();
                    _new.push(pusher);
                }
                setNotifIndex(notifIndex + INDEX_MOVER);
                return _new;
            });
            setLoading(false);
        })();
    }, []);

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target! as HTMLDivElement;
        console.log(!(element.scrollHeight - element.scrollTop === element.clientHeight));
        if (!(element.scrollHeight - element.scrollTop === element.clientHeight)) return;
        setLoading(true);

        // detected bottom
        setCached((old) => {
            const _new = [...old];
            if (notifIndex >= Notifs.length || Notifs.length <= 0) return _new;
            for (let i = notifIndex; i < notifIndex + INDEX_MOVER && i < Notifs.length; i++) {
                let pusher = Notifs[i];
                pusher.react_key_prop_id = Math.random().toString();
                _new.push(pusher);
            }
            setNotifIndex(notifIndex + INDEX_MOVER);
            setLoading(false);
            return _new;
        });

        // setPosts(old => [...old, ...allPosts.splice(postOffset, postOffset + 5)]);
    };

    return (
        <div onScroll={handleScroll} className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-bookmark"></i> Notifications
            </h1>
            <Divider />
            <a onClick={ClearNotifs} className="notif-clear">
                <i className="fa-solid fa-broom-wide"></i> Clear Notifications
            </a>
            <Divider />
            {cached
                ? cached.map((notif: NotificationData) => {
                      console.log(notif);
                      return <NotifBox notif={notif} />;
                  })
                : ""}
            {loading ? <Preloader /> : ""}
        </div>
    );
}

export default MiddleSide;
