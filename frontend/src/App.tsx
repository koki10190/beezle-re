import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import Home from "./Home/Home";
import LoggedIn_Home from "./Pages/LoggedIn/Home";
import Bookmarks_Home from "./Pages/Bookmarks/Home";
import Profile_Home from "./Pages/Profile/Home";
import EditProfile_Home from "./Pages/EditProfile/Home";
import Logout_Home from "./Pages/Logout/Home";
import Post_Home from "./Pages/Post/Home";
import Now_Home from "./Pages/Now/Home";
import { api_uri } from "./links";
import { useEffect } from "react";
import BeezleSocket from "./ws/socket";

interface ConnectionData {
    hello: "hi socket!";
}

function App() {
    useEffect(() => {
        const proto = location.protocol.startsWith("https") ? "wss" : "ws";
        const wsUri = `${proto}://localhost:3000/ws`;

        const socket = new BeezleSocket();
        socket.webSocket.onopen = () => {
            socket.send("connection", {
                some_data: "bleehhh",
            });
        };

        socket.listen("pingpong", (data: object) => {
            const c = data as ConnectionData;

            console.log(c.hello);
        });
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
            </Routes>
        </BrowserRouter>
    );
}

export default App;
