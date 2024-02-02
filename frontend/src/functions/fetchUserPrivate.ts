import axios from "axios";
import { api_uri } from "../links";
import { UserPrivate } from "../types/User";

async function fetchUserPrivate(): Promise<UserPrivate | null> {
    const token = localStorage.getItem("access_token");
    if (!token) window.location.replace("/");

    const res = await axios.post(`${api_uri}/api/get_user`, { token });

    const data = res.data;

    if (data.error) {
        console.error(data.error);
        return null;
    }

    return data as UserPrivate;
}

export { fetchUserPrivate };
