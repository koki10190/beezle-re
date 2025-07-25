import axios from "axios";
import { api_uri } from "../links";
import { UserPrivate } from "../types/User";
import GetAuthToken from "./GetAuthHeader";

async function fetchUserPrivate(access_token?: string): Promise<UserPrivate | null> {
    const token = access_token ?? localStorage.getItem("access_token");
    if (!token) return null;

    const res = await axios.get(`${api_uri}/api/user/private`, {
        headers: GetAuthToken(),
    });

    const data = res.data;

    if (data.error) {
        console.error(data.error);
        return null;
    }

    return data as UserPrivate;
}

export { fetchUserPrivate };
