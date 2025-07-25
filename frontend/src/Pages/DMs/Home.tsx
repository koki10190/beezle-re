import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import LeftSide from "./LeftSide";
import RightSide from "../LoggedIn/RightSide";

import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import { UserPrivate, UserPublic } from "../../types/User";
import Divider from "../../Components/Divider";
import MiddleSide from "./MiddleSide";

function Home() {
    const [dm_user, setDMUser] = useState<UserPublic>();

    useEffect(() => {
        checkToken();
    }, []);
    return (
        <>
            <div className="sides-container">
                <LeftSide setDMUser={setDMUser} />
                <MiddleSide dm_user={dm_user} setDMUser={setDMUser} />
                <RightSide />
            </div>
        </>
    );
}

export default Home;
