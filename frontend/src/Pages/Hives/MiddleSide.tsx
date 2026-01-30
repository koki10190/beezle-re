import axios, { all } from "axios";
import { FormEvent, useEffect, useRef, useState, UIEvent } from "react";
import { BrowserRouter, Routes, Route, redirect, useNavigate } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import PostTyper from "../../Components/PostTyper";
import Divider from "../../Components/Divider";
import PostBox from "../../Components/PostBox";
import { fetchUserPrivate, GetUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import { Post } from "../../types/Post";
import { RefreshPosts } from "../../functions/RefreshPosts";
import GetFullAuth from "../../functions/GetFullAuth";
import { toast } from "react-toastify";
import GetAuthToken from "../../functions/GetAuthHeader";
import HiveBox from "./HiveBox";
import Preloader from "../../Components/Preloader";

enum HivePages {
    SEARCH,
    JOINED,
    EXPLORE,
}

function MiddleSide() {
    const navigate = useNavigate();
    const buttonRef = useRef<HTMLButtonElement>();
    const [search, setSearch] = useState("");
    const [hives, setHives] = useState<Array<BeezleHives.Hive>>([]);
    const [joinedHives, setJoinedHives] = useState<Array<BeezleHives.Hive>>([]);
    const [exploreHives, setExploreHives] = useState<Array<BeezleHives.Hive>>([]);
    const [exploreOffset, setExploreOffset] = useState(0);
    const [page, setPage] = useState<HivePages>(HivePages.SEARCH);
    const [loading, setLoading] = useState(false);

    const Search = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        buttonRef.current!.innerText = "Searching...";
        buttonRef.current!.disabled = true;

        const res = await axios.get(`${api_uri}/api/hives/search`, {
            params: {
                search,
            },
            headers: GetAuthToken(),
        });

        buttonRef.current!.innerText = "Search";
        buttonRef.current!.disabled = false;

        setHives(res.data.hives);
    };

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target! as HTMLDivElement;
        if (!(element.scrollHeight - element.scrollTop === element.clientHeight)) return;

        // detected bottom
        setLoading(true);
        const res = await axios.get(`${api_uri}/api/hives/${PageToAPI(page)}`, {
            params: {
                offset: exploreOffset,
            },
            headers: GetAuthToken(),
        });
        setExploreOffset(res.data.offset);
        switch (page) {
            case HivePages.JOINED: {
                setJoinedHives(res.data.hives);
                break;
            }
            case HivePages.EXPLORE: {
                setExploreHives((old) => [...old, ...res.data.hives]);
                break;
            }
            case HivePages.SEARCH: {
                setHives(res.data.hives);
                break;
            }
        }
        setLoading(false);
    };

    const JoinedHives = async () => {
        if (joinedHives.length > 0) return;
        setLoading(true);
        const res = await axios.get(`${api_uri}/api/hives/get/joined_hives`, GetFullAuth());
        setJoinedHives(res.data.hives);
        setLoading(false);
    };

    const ExploreHives = async () => {
        setLoading(true);
        const res = await axios.get(`${api_uri}/api/hives/explore`, {
            params: {
                offset: 0,
            },
            headers: GetAuthToken(),
        });
        setExploreHives(res.data.hives);
        setExploreOffset(res.data.offset);
        setLoading(false);
    };

    const PageToAPI = (page: number) => {
        switch (page) {
            case HivePages.JOINED: {
                return "get/joined_hives";
            }
            case HivePages.SEARCH: {
                return "search";
            }
            case HivePages.EXPLORE: {
                return "explore";
            }
        }
    };

    const PageToMap = ({ page }: { page: HivePages }) => {
        switch (page) {
            case HivePages.JOINED: {
                return joinedHives.map((hive, index) => {
                    return <HiveBox hive={hive} joined={true} key={hive.hive_id} />;
                });
            }
            case HivePages.SEARCH: {
                return hives.map((hive, index) => {
                    return <HiveBox hive={hive} key={hive.hive_id} />;
                });
            }
            case HivePages.EXPLORE: {
                return exploreHives.map((hive, index) => {
                    return <HiveBox hive={hive} key={hive.hive_id} />;
                });
            }
        }
    };

    const PageToText = () => {
        switch (page) {
            case HivePages.JOINED: {
                return "Joined Hives";
            }
            case HivePages.SEARCH: {
                return "Searched Hives";
            }
            case HivePages.EXPLORE: {
                return "Discover Hives";
            }
        }
    };

    return (
        <div onScroll={page === HivePages.EXPLORE ? handleScroll : () => {}} className="page-sides side-middle home-middle">
            <h1>
                <i className="fa-solid fa-bee"></i> Hives
            </h1>
            <p>
                Discover hives to be apart of inside Beezle
                <span style={{ fontSize: "15px" }} className="home-box-title-re">
                    :RE
                </span>{" "}
                that fits your interests!
            </p>
            <hr
                style={{
                    width: "calc(100% + 40px)",
                    marginLeft: "-20px",
                    borderTop: "1px solid rgba(255, 255,255, 0.4)",
                }}
                className="divider"
            ></hr>
            <form onSubmit={Search} className="hives-search-container">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name, URL or an ID of a Hive"
                    className="input-field"
                    style={{ width: "100%" }}
                />
                <button ref={buttonRef} style={{ width: "100%" }} className="button-field button-field-blurple">
                    Search
                </button>
                <p>
                    Cannot find a Hive related to your interests?{" "}
                    <a onClick={() => navigate("/hives/create")} className="mention">
                        Create one yourself and be the bee queen!
                    </a>
                </p>
                <div className="hive-button-section">
                    <button type="button" onClick={() => setPage(HivePages.SEARCH)} className="button-field button-field-gray">
                        <i className="fa-solid fa-bee"></i> Search Hives
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setPage(HivePages.JOINED);
                            JoinedHives();
                        }}
                        className="button-field button-field-gray"
                    >
                        <i className="fa-solid fa-bee"></i> Joined Hives
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setPage(HivePages.EXPLORE);
                            ExploreHives();
                        }}
                        className="button-field button-field-gray"
                    >
                        <i className="fa-solid fa-sparkles"></i> Discover Hives
                    </button>
                </div>
            </form>
            <hr
                style={{
                    width: "calc(100% + 40px)",
                    marginLeft: "-20px",
                    borderTop: "1px solid rgba(255, 255,255, 0.4)",
                }}
                className="divider"
            ></hr>
            <p>{PageToText()}:</p>
            <PageToMap page={page} />
            {loading ? <Preloader /> : ""}
        </div>
    );
}

export default MiddleSide;
