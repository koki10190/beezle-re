import axios from "axios";
import { api_uri } from "../links";
import { UserPublic } from "../types/User";
import GetAuthToken from "./GetAuthHeader";

var CACHED_USERS: Map<string, UserPublic> = new Map();

async function fetchUserPublic(handle: string, recache: boolean = false): Promise<UserPublic | null> {
    const token = localStorage.getItem("access_token");
    // if (!token) window.location.href = ("/");

    let cached = GetCachedUser(handle);
    if (cached && !recache) return cached;

    const res = await axios.get(`${api_uri}/api/user?handle=${handle}`, { headers: GetAuthToken() });
    const data = res.data;

    CacheUser(data);

    if (data.error) {
        console.error(data.error);
        return null;
    }

    return data as UserPublic;
}

function GetCachedUser(handle: string) {
    return CACHED_USERS.get(handle);
}

function CacheUser(user: UserPublic) {
    CACHED_USERS.set(user.handle, user);
}

export { fetchUserPublic, CACHED_USERS, CacheUser, GetCachedUser };
