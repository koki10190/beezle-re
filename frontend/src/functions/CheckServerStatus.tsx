import axios from "axios";
import { api_uri } from "../links";
import { toast } from "react-toastify";

var SERVER_ONLINE = true;

function CheckServerStatus(): boolean {
    return SERVER_ONLINE;
}

function SetServerStatus(is_on: boolean) {
    SERVER_ONLINE = is_on;
}

function ServerDownMessage() {
    toast.error("Lost connection to the web socket! Retrying..", {
        icon: <i style={{ color: "#ff5050" }} className="fa-solid fa-heart-crack"></i>,
    });
}

export { CheckServerStatus, ServerDownMessage, SetServerStatus, SERVER_ONLINE };
