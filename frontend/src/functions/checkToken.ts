import { redirect } from "react-router-dom";

function checkToken() {
    const token = localStorage.getItem("access_token");
    if (!token) window.location.replace("/");
}

export { checkToken };
