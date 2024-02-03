import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import Home from "./Home/Home";
import LoggedIn_Home from "./Pages/LoggedIn/Home";
import Bookmarks_Home from "./Pages/Bookmarks/Home";
import Profile_Home from "./Pages/Profile/Home";
import EditProfile_Home from "./Pages/EditProfile/Home";
import Logout_Home from "./Pages/Logout/Home";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<LoggedIn_Home />} />
                <Route path="/profile/:handle" element={<Profile_Home />} />
                <Route path="/edit/profile" element={<EditProfile_Home />} />
                <Route path="/logout" element={<Logout_Home />} />
                <Route path="/bookmarks" element={<Bookmarks_Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
