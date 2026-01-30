import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import LeftSide from "../LoggedIn/LeftSide";
import MiddleSide from "./MiddleSide";
import RightSide from "../LoggedIn/RightSide";
import { Helmet } from "react-helmet";

function Home() {
    useEffect(() => {
        checkToken();
    }, []);
    const { handle } = useParams();
    return (
        <>
            <Helmet>Beezle: RE | Followers</Helmet>
            <div key={"followers-" + handle} className="sides-container">
                <LeftSide />
                <MiddleSide />
                <RightSide />
            </div>
        </>
    );
}

export default Home;
