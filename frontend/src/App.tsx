import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import React, { createContext } from "react";
import Home from "./Home/Home";
import LoggedIn_Home from "./Pages/LoggedIn/Home";
import Bookmarks_Home from "./Pages/Bookmarks/Home";
import Profile_Home from "./Pages/Profile/Home";
import EditProfile_Home from "./Pages/EditProfile/Home";
import Logout_Home from "./Pages/Logout/Home";
import Post_Home from "./Pages/Post/Home";
import Now_Home from "./Pages/Now/Home";
import Notifications_Home from "./Pages/Notifications/Home";
import Settings_Home from "./Pages/Settings/Home";
import PrivacyPolicy_Home from "./PrivacyPolicy/Home";
import Dashboard_Home from "./Pages/Dashboard/Home";
import Followers_Home from "./Pages/Followers/Home";
import Following_Home from "./Pages/Following/Home";
import Search_Home from "./Pages/Search/Home";
import FollowingHome_Home from "./Pages/Home/Home";
import Shop_Home from "./Pages/Shop/Home";
import Hives_Home from "./Pages/Hives/Home";
import HivesCreate_Home from "./Pages/HivesCreate/Home";
import HivePage_Home from "./Pages/HivePage/Home";
import EditHive_Home from "./Pages/EditHive/Home";
import HiveDashboard_Home from "./Pages/HiveDashboard/Home";
import Hashtag_Home from "./Pages/Hashtag/Hashtag_Home";
import MostUsedTags_Home from "./Pages/MostUsedTags/MostUsedTags_Home";
import DiscordAuth from "./Pages/Auth/DiscordAuth";
import LastfmAuth from "./Pages/Auth/LastfmAuth";
import APICalls from "./Pages/APICalls/APICalls";
import NotFound from "./Pages/404/NotFound";
import SpotifyAuth from "./Pages/Auth/SpotifyAuth";
import Verify from "./Verify/Verify";
import VerifyPass from "./Verify/VerifyPass";
import Steam from "./Redirects/Steam";

import { api_uri } from "./links";
import { useEffect, useState } from "react";
import { fetchUserPrivate, GetUserPrivate } from "./functions/fetchUserPrivate";
import { Slide, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { socket } from "./ws/socket";
import { SERVER_ONLINE, ServerDownMessage } from "./functions/CheckServerStatus";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { UserPrivate, UserPublic } from "./types/User";

enum UserStatus {
    ONLINE,
    IDLE,
    DND,
    INVISIBLE,
}

interface WsUserData {
    handle: "hi socket!";
    status: UserStatus;
}

export const SiteContext = createContext(null);

function App() {
    const [notifCounter, setNotifCounter] = useState(0);
    const [PrivateUser, setPrivateUser] = useState<UserPublic>();

    socket.listen("from_other", (data: { message: string }) => {
        // console.log("ALERT! DATA GOT", data);
    });

    useEffect(() => {
        (async () => {
            setPrivateUser(await fetchUserPrivate());
        })();
    }, []);

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                className="toasty"
                transition={Slide}
                style={{
                    zIndex: 1000000,
                }}
            />
            <BrowserRouter>
                <Routes>
                    <Route path="/logout" element={<Logout_Home />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<FollowingHome_Home />} />
                    <Route path="/hives" element={<Hives_Home />} />
                    <Route path="/hive/:handle" element={<HivePage_Home />} />
                    <Route path="/hives/create" element={<HivesCreate_Home />} />
                    <Route path="/hives/edit/:hive_id" element={<EditHive_Home />} />
                    <Route path="/hives/dashboard/:hive_id" element={<HiveDashboard_Home />} />
                    <Route path="/api-calls" element={<APICalls />} />
                    <Route path="/most-used-hashtags" element={<MostUsedTags_Home />} />
                    <Route path="/hashtag/:hashtag" element={<Hashtag_Home />} />
                    <Route path="/explore" element={<LoggedIn_Home />} />
                    <Route path="/right-now" element={<Now_Home />} />
                    <Route path="/edit/profile" element={<EditProfile_Home />} />
                    <Route path="/profile/:handle" element={<Profile_Home />} />
                    <Route path="/p/:handle" element={<Profile_Home />} />
                    <Route path="/user/:handle" element={<Profile_Home />} />
                    <Route path="/user/:handle" element={<Profile_Home />} />
                    <Route path="/bookmarks" element={<Bookmarks_Home />} />
                    <Route path="/post/:post_id" element={<Post_Home />} />
                    <Route path="/notifications" element={<Notifications_Home />} />
                    <Route path="/settings" element={<Settings_Home />} />
                    <Route path="/dashboard" element={<Dashboard_Home />} />
                    <Route path="/followers/:handle" element={<Followers_Home />} />
                    <Route path="/following/:handle" element={<Following_Home />} />
                    <Route path="/verify/:auth_id" element={<Verify />} />
                    <Route path="/verify_pass/:auth_id" element={<VerifyPass />} />
                    <Route path="/privacy-and-terms" element={<PrivacyPolicy_Home />} />
                    <Route path="/shop" element={<Shop_Home />} />
                    <Route path="/connect/steam" element={<Steam />} />
                    <Route path="/search" element={<Search_Home />} />
                    <Route path="/discord_auth" element={<DiscordAuth />} />
                    <Route path="/spotify-auth" element={<SpotifyAuth />} />
                    <Route path="/lastfm_auth" element={<LastfmAuth />} />
                    <Route path="/not-found" element={<NotFound />} />
                    <Route path="/:handle" element={<Profile_Home />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
