import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/main.css";
import { socket, BeezleSocket } from "./ws/socket";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
