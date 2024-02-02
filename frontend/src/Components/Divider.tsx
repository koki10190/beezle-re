import axios from "axios";
import { FormEvent, LegacyRef, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import "./Divider.css";

function Divider() {
    return <hr className="divider"></hr>;
}

export default Divider;
