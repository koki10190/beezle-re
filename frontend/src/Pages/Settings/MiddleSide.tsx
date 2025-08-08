import { useEffect, useRef, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate } from "../../types/User";
import { Post } from "../../types/Post";
import { FetchPost } from "../../functions/FetchPost";
import { NotificationData } from "../../types/Notification";
import "./Settings.css";
import axios from "axios";
import { api_uri } from "../../links";
import Details from "./Pages/Details";
import API from "./Pages/API";
import Report from "./Pages/Report";
import Connections from "./Pages/Connections";
import CustomEmojis from "./Pages/CustomEmojis";
import { toast } from "react-toastify";
import ChangeAccounts from "./Pages/ChangeAccounts";
import PostPreferences from "./Pages/PostPreferences";
import GetAuthToken from "../../functions/GetAuthHeader";

function SettingsButton({
    redirect = "",
    iconClass,
    text,
    style,
    onClick = () => {},
}: {
    redirect?: string;
    iconClass: string;
    text: string;
    style: any | undefined;
    onClick?: () => void;
}) {
    return (
        <>
            {redirect ? (
                <a onClick={onClick} style={style ? style : {}} href={redirect} className="settings-button">
                    <i className={iconClass}></i> {text}
                </a>
            ) : (
                <a onClick={onClick} style={style ? style : {}} className="settings-button">
                    <i className={iconClass}></i> {text}
                </a>
            )}
        </>
    );
}

enum Pages {
    DETAILS,
    API,
    REPORT,
    CONNECTIONS,
    CUSTOM_EMOJIS,
    CHANGE_ACCOUNTS,
    POST_PREFERENCES,
}

function RightSide({ setPage }: { setPage: any }) {
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
                middle.style.display = null;
                middle.style.width = null;
                right.removeAttribute("style");

                setExpanded(false);
            }

            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", onResize);
    }, [self_user]);

    const DeleteAccount = async () => {
        await axios.delete(`${api_uri}/api/user/delete`, {
            headers: GetAuthToken(),
        });
        toast.success("Account has been deleted, bye bye :(");
        window.location.href = "/logout";
    };

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
                    <button onClick={() => (sureRef.current!.style.display = "none")} style={{ display: "inline-block" }} className="button-field">
                        Cancel
                    </button>
                </div>
            </div>
            <div className="page-sides side-right">
                <SettingsButton onClick={() => setPage(Pages.DETAILS)} iconClass="fa-solid fa-id-badge" text="Details" style={undefined} />
                <SettingsButton onClick={() => setPage(Pages.API)} iconClass="fa-solid fa-square-code" text="API" style={undefined} />
                <SettingsButton onClick={() => setPage(Pages.REPORT)} iconClass="fa-solid fa-flag" text="Report" style={undefined} />
                <SettingsButton
                    onClick={() => setPage(Pages.CONNECTIONS)}
                    iconClass="fa-solid fa-address-card"
                    text="Connections"
                    style={undefined}
                />
                <SettingsButton onClick={() => setPage(Pages.CUSTOM_EMOJIS)} iconClass="fa-solid fa-icons" text="Custom Emojis" style={undefined} />
                <SettingsButton onClick={() => setPage(Pages.CHANGE_ACCOUNTS)} iconClass="fa-solid fa-users" text="Accounts" style={undefined} />
                {/* <SettingsButton onClick={() => setPage(Pages.POST_PREFERENCES)} iconClass="fa-solid fa-comment" text="Posts" style={undefined} /> */}
                <SettingsButton redirect="/home" iconClass="fa-solid fa-home" text="Go Back" style={undefined} />
                <SettingsButton
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
    const [self_user, setSelfUser] = useState<UserPrivate>();
    const [page, setPage] = useState<Pages>(Pages.DETAILS);

    useEffect(() => {
        (async () => {
            const user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(user);
        })();
    }, []);
    return (
        <>
            {self_user
                ? (() => {
                      switch (page) {
                          case Pages.DETAILS:
                              return <Details user={self_user} />;
                          case Pages.API:
                              return <API user={self_user} />;
                          case Pages.REPORT:
                              return <Report user={self_user} />;
                          case Pages.CONNECTIONS:
                              return <Connections user={self_user} />;
                          case Pages.CUSTOM_EMOJIS:
                              return <CustomEmojis user={self_user} />;
                          case Pages.CHANGE_ACCOUNTS:
                              return <ChangeAccounts user={self_user} />;
                          case Pages.POST_PREFERENCES:
                              return <PostPreferences user={self_user} />;
                      }
                  })()
                : ""}
            {/* <div className="page-sides side-middle home-middle"></div> */}
            <RightSide setPage={setPage} />
        </>
    );
}

export default MiddleSide;
