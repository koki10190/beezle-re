import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import { api_uri } from "../../links";
import { checkToken } from "../../functions/checkToken";

function MiddleSide() {
    checkToken();

    return <div className="page-sides side-middle"></div>;
}

export default MiddleSide;
