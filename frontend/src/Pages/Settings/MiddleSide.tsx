import { useEffect, useRef, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate } from "../../types/User";
import { Post } from "../../types/Post";
import FetchPost from "../../functions/FetchPost";
import { socket } from "../../ws/socket";
import { NotificationData } from "../../types/Notification";
import "./Settings.css";

function SettingsButton({
    redirect,
    iconClass,
    text,
    style,
    onClick = () => {},
}: {
    redirect: string;
    iconClass: string;
    text: string;
    style: any | undefined;
    onClick?: () => void;
}) {
    return (
        <a onClick={onClick} style={style ? style : {}} href={redirect} className="settings-button">
            <i className={iconClass}></i> {text}
        </a>
    );
}

function RightSide() {
    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);
    const [isExpanded, setExpanded] = useState(false);
    const [window_width, setWindowWidth] = useState(window.innerWidth);
    const [notifCount, setNotifCount] = useState(0);
    const sureRef = useRef<HTMLDivElement>(null);

    const ExpandRightSide = () => {
        const middle = document.querySelector(".side-middle") as HTMLDivElement;
        const right = document.querySelector(".side-right") as HTMLDivElement;

        middle.style.display = isExpanded ? "block" : "none";
        right.style.display = isExpanded ? "none" : "flex";
        right.style.width = isExpanded ? "25%" : "100%";

        setExpanded(!isExpanded);
    };
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth > 1100) {
                let middle = document.querySelector(".side-middle") as HTMLDivElement;
                let right = document.querySelector(".side-right") as HTMLDivElement;
                middle.removeAttribute("style");
                right.removeAttribute("style");

                setExpanded(false);
            }

            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", onResize);
    }, [self_user]);

    const DeleteAccount = () => {};

    return (
        <>
            <div ref={sureRef} className="settings-areyousure">
                <h1>ARE YOU SURE?</h1>
                <h2>This will delete your entire account!</h2>
                <div>
                    <button
                        onClick={DeleteAccount}
                        style={{ marginRight: "20px", display: "inline-block" }}
                        className="button-field-red button-field"
                    >
                        Delete My Account
                    </button>
                    <button
                        onClick={() => (sureRef.current!.style.display = "none")}
                        style={{ display: "inline-block" }}
                        className="button-field"
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <div className="page-sides side-right">
                <SettingsButton redirect="/home" iconClass="fa-solid fa-id-badge" text="Details" style={undefined} />
                <SettingsButton
                    redirect="/home"
                    iconClass="fa-solid fa-trash"
                    text="Delete Account"
                    onClick={() => (sureRef.current!.style.display = "flex")}
                    style={{ color: "red" }}
                />
            </div>
            {window_width < 1100 ? (
                <a onClick={ExpandRightSide} className="open-panel-button">
                    <i className="fa-solid fa-left-to-line"></i>
                </a>
            ) : (
                ""
            )}
        </>
    );
}

function MiddleSide() {
    const [posts, setPosts] = useState<Array<Post>>([]);
    const [self_user, setSelfUser] = useState<UserPrivate>();

    useEffect(() => {
        (async () => {
            const user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(user);

            console.log("foreach");
            user.bookmarks.forEach(async (post_id: string) => {
                console.log(post_id);
                const post = await FetchPost(post_id);
                setPosts(old => [...old, post]);
            });
        })();
    }, []);
    return (
        <>
            <div className="page-sides side-middle home-middle"></div>
            <RightSide />
        </>
    );
}

export default MiddleSide;
