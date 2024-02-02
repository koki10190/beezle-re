import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import React from "react";
import { checkToken } from "../../functions/checkToken";

function RightSide() {
    checkToken();

    return <div className="page-sides side-right"></div>;
}

export default RightSide;
