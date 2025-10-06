import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import LeftSide from "../LoggedIn/LeftSide";
import MiddleSide from "./MiddleSide";
import RightSide from "../LoggedIn/RightSide";
import "../LoggedIn.css";
import "../../assets/main.css";
import { Helmet } from "react-helmet";

function DMs_Home() {
    useEffect(() => {
        checkToken();
    }, []);
    let { handle } = useParams();

    return (
        <>
            <div key={"dms-" + handle} className="sides-container">
                <MiddleSide handle={handle?.replace(/@/g, "") as string} />
                <RightSide forceExpansion={true} />
            </div>
        </>
    );
}

export default DMs_Home;
