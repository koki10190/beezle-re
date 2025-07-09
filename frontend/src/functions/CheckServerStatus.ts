import axios from "axios";
import { api_uri } from "../links";

async function CheckServerStatus(): Promise<boolean> {
    try {
        const res = await axios.get(`${api_uri}`);
        if (res.data === "Hello world!") return true;

        return false;
    } catch (e) {
        console.log("Servers are probably down!", e);
        return false;
    }
}

export default CheckServerStatus;
