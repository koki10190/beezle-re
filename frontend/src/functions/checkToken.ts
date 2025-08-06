import { redirect } from "react-router-dom";
import { fetchUserPrivate, GetUserPrivate } from "./fetchUserPrivate";
import { api_uri } from "../links";
import axios from "axios";
import { toast } from "react-toastify";
import { socket } from "../ws/socket";
import { SERVER_ONLINE } from "./CheckServerStatus";

async function checkToken() {
    const token = localStorage.getItem("access_token");
    if (!token) window.location.href = "/";

    if (!SERVER_ONLINE) {
        toast.error("Oops! Seems like the servers are down.");
    }
}

export { checkToken };
