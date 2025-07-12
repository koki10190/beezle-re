import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
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
import DMs_Home from "./Pages/DMs/Home";
import { api_uri } from "./links";
import { useEffect, useState } from "react";
import { fetchUserPrivate } from "./functions/fetchUserPrivate";
import Verify from "./Verify/Verify";
import VerifyPass from "./Verify/VerifyPass";
import Steam from "./Redirects/Steam";
import dmSocket from "./ws/dm-socket";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./Pages/404/NotFound";
import SpotifyAuth from "./Pages/Auth/SpotifyAuth";
import { socket } from "./ws/socket";
import Hashtag_Home from "./Pages/Hashtag/Hashtag_Home";
import MostUsedTags_Home from "./Pages/MostUsedTags/MostUsedTags_Home";

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
function App() {
    dmSocket.on("connect", () => {
        let _ = setInterval(async () => {
            console.log("Intervalling DM..");
            const user = await fetchUserPrivate();
            if (!user) return;

            dmSocket.emit("get handle", user.handle);

            clearInterval(_);
        }, 100);
    });

    // dmSocket.on("get me handle", () => {
    //     dmSocket.emit("get handle", user.handle);
    // });

    socket.webSocket.onopen = async () => {
        let _ = setInterval(async () => {
            console.log("Intervalling Socket Connection..");
            const user = await fetchUserPrivate();
            if (!user) return;

            socket.send("connect", {
                handle: user.handle,
            });

            socket.send("ping", {});

            clearInterval(_);
        }, 100);
    };

    socket.listen("pong", () => {
        console.log("Got a pong, sending a ping");
        setTimeout(() => socket.send("ping", {}), 5000);
    });

    socket.listen("from_other", (data: { message: string }) => {
        console.log("ALERT! DATA GOT", data);
    });

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
                transition={Slide}
            />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<FollowingHome_Home />} />
                    <Route path="/most-used-hashtags" element={<MostUsedTags_Home />} />
                    <Route path="/hashtag/:hashtag" element={<Hashtag_Home />} />
                    <Route path="/explore" element={<LoggedIn_Home />} />
                    <Route path="/right-now" element={<Now_Home />} />
                    <Route path="/edit/profile" element={<EditProfile_Home />} />
                    <Route path="/profile/:handle" element={<Profile_Home />} />
                    <Route path="/p/:handle" element={<Profile_Home />} />
                    <Route path="/user/:handle" element={<Profile_Home />} />
                    <Route path="/user/:handle" element={<Profile_Home />} />
                    <Route path="/logout" element={<Logout_Home />} />
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
                    <Route path="/dms" element={<DMs_Home />} />
                    <Route path="/dms/:user_handle" element={<DMs_Home />} />
                    <Route path="/spotify-auth" element={<SpotifyAuth />} />
                    <Route path="/not-found" element={<NotFound />} />
                    <Route path="/:handle" element={<Profile_Home />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
