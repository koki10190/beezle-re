import axios from "axios";
import { FormEvent, LegacyRef, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import "./Divider.css";

function Divider({ full_page = false }: { full_page?: boolean }) {
    return full_page ? (
        <hr
            style={{
                width: "calc(100% + 40px)",
                marginLeft: "-20px",
                borderTop: "1px solid rgba(255, 255,255, 0.4)",
            }}
            className="divider"
        ></hr>
    ) : (
        <hr className="divider"></hr>
    );
}

export default Divider;
