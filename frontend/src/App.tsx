import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import Home from "./Home/Home";
import LoggedIn_Home from "./Pages/LoggedIn/Home";
import Profile_Home from "./Pages/Profile/Home";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<LoggedIn_Home />} />
                <Route path="/profile/:handle" element={<Profile_Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
