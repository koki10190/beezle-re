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

function HiveDashboard_Home() {
    useEffect(() => {
        checkToken();
    }, []);
    let { handle } = useParams();

    return (
        <>
            <div className="sides-container">
                <LeftSide />
                <MiddleSide />
                <RightSide />
            </div>
        </>
    );
}

export default HiveDashboard_Home;
