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
import React from "react";
import { Helmet } from "react-helmet";

function Hashtag_Home() {
    useEffect(() => {
        checkToken();
    }, []);
    const { hashtag } = useParams();

    return (
        <>
            <Helmet>
                <title>Beezle: RE | Posts with #{hashtag}</title>
            </Helmet>
            <div key={"hashtag-" + hashtag} className="sides-container">
                <LeftSide />
                <MiddleSide />
                <RightSide />
            </div>
        </>
    );
}

export default Hashtag_Home;
