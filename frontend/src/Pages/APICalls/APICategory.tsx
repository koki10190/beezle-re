import axios from "axios";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import react from "react";
import "./APICalls.css";
import Divider from "../../Components/Divider";
import { CodeBlock, dracula } from "react-code-blocks";

interface Props {
    name: string;
    color?: string;
    children: React.ReactNode;
}

function APICategory(props: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className={`api-category ${props.color ?? ""}`}>
                <h2>
                    {props.name}{" "}
                    <a onClick={() => setOpen((old) => !old)} className={`api-category-button ${open ? "api-category-button-close" : ""}`}>
                        <i className={`fa-solid fa-arrow-${open ? "up" : "down"}`} />
                    </a>
                </h2>
            </div>
            <div className="api-category-calls" style={{ display: open ? "block" : "none" }}>
                {props.children}
            </div>
        </>
    );
}

export default APICategory;
