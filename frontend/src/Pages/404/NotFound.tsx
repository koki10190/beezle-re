import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import react from "react";
import "./NotFound.css";
import { Helmet } from "react-helmet";

function NotFound() {
    return (
        <>
            <Helmet>
                <title>Beezle: RE | Not Found!</title>
            </Helmet>
            <div style={{ textAlign: "center" }} className="centered">
                <h1>404 Not Found</h1>
                <h3
                    style={{
                        marginTop: "-20px",
                        color: "#ffffffa0",
                    }}
                >
                    The bees cannot find their hive {":("}
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
