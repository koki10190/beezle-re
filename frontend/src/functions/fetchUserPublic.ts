import axios from "axios";
import { api_uri } from "../links";
import { UserPublic } from "../types/User";
import GetAuthToken from "./GetAuthHeader";

async function fetchUserPublic(handle: string): Promise<UserPublic | null> {
    const token = localStorage.getItem("access_token");
    // if (!token) window.location.href = ("/");

    const res = await axios.get(`${api_uri}/api/get_user?handle=${handle}`, { headers: GetAuthToken() });
    const data = res.data;

    if (data.error) {
        console.error(data.error);
        return null;
    }

    return data as UserPublic;
}

export { fetchUserPublic };
