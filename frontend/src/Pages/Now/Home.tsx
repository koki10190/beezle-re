import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";
import LeftSide from "../LoggedIn/LeftSide";
import MiddleSide from "./MiddleSide";
import RightSide from "../LoggedIn/RightSide";
import "../LoggedIn.css";
import "../../assets/main.css";
import React from "react";

function Home() {
    checkToken();

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

export default Home;
