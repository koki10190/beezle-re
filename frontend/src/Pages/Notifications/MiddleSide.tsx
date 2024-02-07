import { useEffect, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate } from "../../types/User";
import { Post } from "../../types/Post";
import FetchPost from "../../functions/FetchPost";
import { NotificationData } from "../../types/Notification";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import NotifBox from "../../Components/NotifBox";

function MiddleSide() {
    const [Notifs, setNotifs] = useState<Array<NotificationData>>([]);

    useEffect(() => {
        let notifs = JSON.parse(
            localStorage.getItem("notifs") ? localStorage.getItem("notifs")! : "[]"
        ) as Array<NotificationData>;

        notifs.forEach((notif: NotificationData) => {
            (async () => {
                notif.react_key_prop_id = Math.random().toString();
                // notif.user = await fetchUserPublic(notif.caller);
            })();
        });

        setNotifs(notifs);
    }, []);
    return (
        <div className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-bookmark"></i> Notifications
            </h1>
            <Divider />
            {Notifs.map((notif: NotificationData) => {
                return <NotifBox key={notif.react_key_prop_id} notif={notif} />;
            })}
        </div>
    );
}

export default MiddleSide;
