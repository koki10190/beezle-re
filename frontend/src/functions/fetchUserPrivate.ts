import axios from "axios";
import { api_uri } from "../links";
import { UserPrivate } from "../types/User";
import GetAuthToken from "./GetAuthHeader";
import { CacheUser } from "./fetchUserPublic";

var USER_PRIVATE = undefined;

async function fetchUserPrivate(access_token?: string): Promise<UserPrivate | null> {
    const token = access_token ?? localStorage.getItem("access_token");
    if (!token) return null;

    if (USER_PRIVATE && !access_token) return USER_PRIVATE;

    const res = await axios.get(`${api_uri}/api/user/private`, {
        headers: {
            Authorization: token,
        },
    });

    const data = res.data;

    if (data.error) {
        console.error(data.error);
        return null;
    }

    USER_PRIVATE = data;
    CacheUser(data);

    return USER_PRIVATE as UserPrivate;
}

function GetUserPrivate() {
    return USER_PRIVATE;
}

export { fetchUserPrivate, GetUserPrivate, USER_PRIVATE };
