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

function Home() {
    useEffect(() => {
        checkToken();
    }, []);
    const { handle } = useParams();

    return (
        <>
            <div className="sides-container">
                <LeftSide />
                <MiddleSide handle={handle as string} />
                <RightSide />
            </div>
        </>
    );
}

export default Home;
