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
import { api_uri } from "./links";
import { useEffect, useState } from "react";
import { socket } from "./ws/socket";
import { fetchUserPrivate } from "./functions/fetchUserPrivate";

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
    socket.webSocket.onopen = async () => {
        console.log("opened socket");

        let _ = setInterval(async () => {
            console.log("Intervalling..");
            const user = await fetchUserPrivate();
            if (!user) return;

            socket.send("connection", {
                handle: user.handle,
                status: UserStatus.ONLINE,
            });

            clearInterval(_);
        }, 1000);
    };

    socket.listen("connected", (data: object) => {
        console.log(data);
    });

    socket.listen("test_session", (data: object) => {
        console.log("test_session", data);
    });

    useEffect(() => {
        // Socket setup
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<LoggedIn_Home />} />
                <Route path="/explore" element={<LoggedIn_Home />} />
                <Route path="/right-now" element={<Now_Home />} />
                <Route path="/profile/:handle" element={<Profile_Home />} />
                <Route path="/edit/profile" element={<EditProfile_Home />} />
                <Route path="/logout" element={<Logout_Home />} />
                <Route path="/bookmarks" element={<Bookmarks_Home />} />
                <Route path="/post/:post_id" element={<Post_Home />} />
                <Route path="/notifications" element={<Notifications_Home />} />
                <Route path="/settings" element={<Settings_Home />} />
                <Route path="/dashboard" element={<Dashboard_Home />} />
                <Route path="/privacy-and-terms" element={<PrivacyPolicy_Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
