import { useEffect, useState } from "react";
import { NotificationData } from "../types/Notification";
import "./NotifBox.css";
import { UserPublic } from "../types/User";
import { fetchUserPublic } from "../functions/fetchUserPublic";

function NotifBox({ notif }: { notif: NotificationData }) {
    const [user, setUser] = useState<UserPublic | null>();
    const [isPost, setIsPost] = useState(false);

    useEffect(() => {
        (async () => {
            setUser(await fetchUserPublic(notif.caller));
        })();
    }, []);

    return (
        <div
            onClick={() => {
                if ((notif as any).post_id) {
                    window.location.href = `/post/${notif.post_id}`;
                    setIsPost(true);
                }
                if ((notif as any).handle) {
                    window.location.href = `/profile/${(notif as any).handle}`;
                }
            }}
            className="notif"
        >
            {user ? (
                <>
                    <div
                        style={{
                            backgroundImage: `url(${user.avatar})`,
                            borderRadius: user.customization?.square_avatar ? "5px" : "100%",
                        }}
                        className="notif-pfp"
                    ></div>
                    <p className="notif-message">
                        <span
                            onClick={(e: any) => {
                                e.stopPropagation();
                                window.location.href = `/profile/${user.handle}`;
                            }}
                            className="notif-handle"
                        >
                            @{notif.caller}
                        </span>{" "}
                        <span className="notif-content">{notif.message}</span>
                    </p>
                </>
            ) : (
                ""
            )}
        </div>
    );
}

export default NotifBox;
