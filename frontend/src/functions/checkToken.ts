import { redirect } from "react-router-dom";
import { fetchUserPrivate } from "./fetchUserPrivate";
import { api_uri } from "../links";
import axios from "axios";
import { toast } from "react-toastify";
import CheckServerStatus from "./CheckServerStatus";

async function checkToken() {
    const token = localStorage.getItem("access_token");
    if (!token) window.location.href = "/";
    const user = await fetchUserPrivate();
    if (!user) window.location.href = "/";

    if (!(await CheckServerStatus())) {
        toast.error("Oops! Seems like the servers are down, sorry :(");
        window.location.href = "/";
    }
}

export { checkToken };
