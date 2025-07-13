import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import react from "react";
import "./NotFound.css";

function NotFound() {
    return (
        <>
            <div style={{ textAlign: "center" }} className="centered">
                <h1>404 Not Found</h1>
                <h3
                    style={{
                        marginTop: "-20px",
                        color: "#ffffffa0",
                    }}
                >
                    The bees cannot find their hives {":("}
                </h3>
            </div>
            <div className="snowflakes" aria-hidden="true">
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
                <div className="snowflake">
                    <div className="inner">🐝</div>
                </div>
            </div>
        </>
    );
}

export default NotFound;
