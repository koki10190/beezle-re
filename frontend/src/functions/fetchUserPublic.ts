import axios from "axios";
import { api_uri, server_uri } from "../links";
import { UserPublic } from "../types/User";
import GetAuthToken from "./GetAuthHeader";

var CACHED_USERS: Map<string, UserPublic> = new Map();
var CACHED_STATUSES: Map<string, string> = new Map();
var RECACHE_STATUSES = true;

setInterval(() => {
    CACHED_STATUSES = new Map();
}, 7000);

async function fetchUserPublic(handle: string, recache: boolean = false): Promise<UserPublic | null> {
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

async function fetchUserStatus(handle: string, recache: boolean = false) {
    let cached = GetCachedStatus(handle);
    if (cached && !recache) return cached;

    const res = await axios.get(`https://${server_uri}/status/${handle}`);
    CacheStatus(handle, res.data?.status ?? "offline");
    return res.data?.status ?? "offline";
}

function GetCachedUser(handle: string) {
    return CACHED_USERS.get(handle);
}

function CacheUser(user: UserPublic) {
    CACHED_USERS.set(user.handle, user);
}

function GetCachedStatus(handle: string) {
    return CACHED_STATUSES.get(handle);
}

function CacheStatus(handle: string, status: string) {
    CACHED_STATUSES.set(handle, status);
}

export { fetchUserPublic, CACHED_USERS, CacheUser, GetCachedUser, fetchUserStatus };
