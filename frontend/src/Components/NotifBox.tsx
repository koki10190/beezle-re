import { useEffect, useState } from "react";
import { NotificationData } from "../types/Notification";
import "./NotifBox.css";

function NotifBox({ notif }: { notif: NotificationData }) {
    return (
        <div className="notif">
            <div style={{ backgroundImage: `url(${notif.user?.avatar})` }} className="notif-pfp"></div>
            <p onClick={() => (window.location.href = `/post/${notif.post_id}`)} className="notif-message">
                <span
                    onClick={() => (window.location.href = `/profile/${notif.user?.handle}`)}
                    className="notif-handle"
                >
                    @{notif.user?.handle}
                </span>
                <span className="notif-content">{notif.message}</span>
            </p>
        </div>
    );
}

export default NotifBox;
