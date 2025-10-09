import axios from "axios";
import { api_uri } from "../links";
import GetAuthToken from "./GetAuthHeader";

var CACHED_GCs: Map<string, BeezleDM.GroupChat> = new Map();

async function fetchGroupChat(group_id: string, recache: boolean = false): Promise<BeezleDM.GroupChat | null> {
    let cached = GetCachedGC(group_id);
    if (cached && !recache) return cached;

    const res = await axios.get(`${api_uri}/api/dms/get_gc?group_id=${group_id}`, { headers: GetAuthToken() });
    const data = res.data.group;

    CacheGC(data);

    if (data.error) {
        console.error(data.error);
        return null;
    }

    return data as BeezleDM.GroupChat;
}

function GetCachedGC(handle: string) {
    return CACHED_GCs.get(handle);
}

function CacheGC(gc: BeezleDM.GroupChat) {
    CACHED_GCs.set(gc.group_id, gc);
}

export { fetchGroupChat, CACHED_GCs, CacheGC, GetCachedGC };
