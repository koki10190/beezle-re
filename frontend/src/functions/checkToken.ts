import { redirect } from "react-router-dom";
import { fetchUserPrivate } from "./fetchUserPrivate";

async function checkToken() {
    const token = localStorage.getItem("access_token");
    if (!token) window.location.replace("/");

    const user = await fetchUserPrivate();

    if (!user) window.location.replace("/");
}

export { checkToken };
