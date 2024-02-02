import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";

function LeftSide() {
    checkToken();

    return <div className="page-sides side-left"></div>;
}

export default LeftSide;
