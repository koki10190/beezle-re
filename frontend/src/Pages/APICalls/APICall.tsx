import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect, useParams } from "react-router-dom";
import react from "react";
import "./APICalls.css";
import Divider from "../../Components/Divider";
import { CodeBlock, dracula } from "react-code-blocks";

type RESTMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface Props {
    method: RESTMethod;
    path: string;
    desc: string;
    response: object | string;
    payload: object | string;
}

function APICall(props: Props) {
    return (
        <>
            <div className="api-call">
                <p className="api-call-uri">
                    <span className={`api-call-method ${props.method}`}>{props.method}</span> - <span className="api-call-url">{props.path}</span>
                </p>
                <p>{props.desc}</p>
                <div>
                    <p style={{ color: "orange", marginBottom: "0px" }}>
                        <b>Response:</b>
                    </p>
                    <CodeBlock
                        text={typeof props.response === "string" ? props.response : JSON.stringify(props.response, null, 4)}
                        customStyle={{
                            fontFamily: "gordin, sans-serif",
                        }}
                        language={typeof props.response === "string" ? "typescript" : "json"}
                        showLineNumbers={true}
                        theme={dracula}
                    />
                    <p style={{ color: "cyan", marginBottom: "0px" }}>
                        <b>{props.method === "GET" || props.method === "DELETE" ? "Parameters (?param1=&param2)" : "Payload"}:</b>
                    </p>
                    <CodeBlock
                        text={typeof props.payload === "string" ? props.payload : JSON.stringify(props.payload, null, 4)}
                        customStyle={{
                            fontFamily: "gordin, sans-serif",
                        }}
                        language={typeof props.payload === "string" ? "typescript" : "json"}
                        showLineNumbers={true}
                        theme={dracula}
                    />
                </div>
            </div>
            <hr style={{ borderTop: "1px solid #ffffffa0" }} className="divider"></hr>
        </>
    );
}

export default APICall;
