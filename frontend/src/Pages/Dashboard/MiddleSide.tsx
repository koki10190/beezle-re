import { useEffect, useRef, useState } from "react";
import { checkToken } from "../../functions/checkToken";

import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { BadgeType, UserPrivate } from "../../types/User";
import { Post } from "../../types/Post";
import { FetchPost } from "../../functions/FetchPost";
import { NotificationData } from "../../types/Notification";
import "./Settings.css";
import axios from "axios";
import { api_uri } from "../../links";
import Report from "./Pages/Reports";
import BanUser from "./Pages/BanUser";
import DeletePost from "./Pages/DeletePost";
import VerifyUser from "./Pages/VerifyUser";

function DashboardButton({
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
    REPORTS,
    BAN_USER,
    DELETE_POST,
    VERIFY_USER,
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

        // middle.style.display = isExpanded ? "block" : "none";
        // right.style.display = isExpanded ? "none" : "flex";
        // right.style.width = isExpanded ? "25%" : "100%";

        setExpanded(!isExpanded);
    };

    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth > 1100) {
                let middle = document.querySelector(".side-middle") as HTMLDivElement;
                let right = document.querySelector(".side-right") as HTMLDivElement;
                middle.style.display = null;
                right.style.width = null;

                setExpanded(false);
            }

            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", onResize);
    }, [self_user]);

    return (
        <>
            <div
                style={
                    window_width < 1100
                        ? {
                              display: "flex",
                              backgroundColor: "rgba(0,0,0,0.7)",
                              position: "absolute",
                              width: "100%",
                              borderLeft: "none",
                              opacity: !isExpanded ? "0" : "1",
                              transition: "all .2s",
                              visibility: !isExpanded ? "hidden" : "visible",
                          }
                        : {}
                }
                className="page-sides side-right"
            >
                <DashboardButton
                    onClick={() => {
                        setExpanded(false);
                        setPage(Pages.REPORTS);
                    }}
                    iconClass="fa-solid fa-flag"
                    text="Reports"
                    style={undefined}
                />
                <DashboardButton
                    onClick={() => {
                        setExpanded(false);
                        setPage(Pages.BAN_USER);
                    }}
                    iconClass="fa-solid fa-hammer-crash"
                    text="Ban User"
                    style={undefined}
                />
                <DashboardButton
                    onClick={() => {
                        setExpanded(false);
                        setPage(Pages.DELETE_POST);
                    }}
                    iconClass="fa-solid fa-trash"
                    text="Delete Post"
                    style={undefined}
                />
                <DashboardButton
                    onClick={() => {
                        setExpanded(false);
                        setPage(Pages.VERIFY_USER);
                    }}
                    iconClass="fa-solid fa-badge-check"
                    text="Verify User"
                    style={undefined}
                />
                <DashboardButton redirect="/home" iconClass="fa-solid fa-home" text="Go Back" style={undefined} />
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
    const [page, setPage] = useState<Pages>(Pages.REPORTS);

    useEffect(() => {
        (async () => {
            const user = (await fetchUserPrivate()) as UserPrivate;
            setSelfUser(user);

            let hasBadge = false;
            user.badges.forEach((badge) => {
                if (badge == BadgeType.MODERATOR || badge == BadgeType.OWNER) {
                    hasBadge = true;
                }
            });

            if (!hasBadge) {
                window.location.href = "/home";
            }
        })();
    }, []);
    return (
        <>
            {self_user
                ? (() => {
                      switch (page) {
                          case Pages.REPORTS:
                              return <Report user={self_user} />;
                          case Pages.BAN_USER:
                              return <BanUser user={self_user} />;
                          case Pages.DELETE_POST:
                              return <DeletePost user={self_user} />;
                          case Pages.VERIFY_USER:
                              return <VerifyUser user={self_user} />;
                      }
                  })()
                : ""}
            {/* <div className="page-sides side-middle home-middle"></div> */}
            <RightSide setPage={setPage} />
        </>
    );
}

export default MiddleSide;
