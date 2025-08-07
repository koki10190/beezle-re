import axios from "axios";
import { api_uri } from "../links";
import { Post } from "../types/Post";
import GetFullAuth from "./GetFullAuth";

var CACHED_POSTS: Map<string, Post> = new Map();

async function FetchPost(post_id: string): Promise<Post> {
    const cache = GetCachedPost(post_id);
    if (cache) return cache;

    const res = await axios.get(`${api_uri}/api/post/get/one?post_id=${post_id}`, GetFullAuth());
    CachePost(res.data as Post);

    return res.data;
}

function CachePost(post: Post) {
    CACHED_POSTS.set(post.post_id, post);
}

function GetCachedPost(post_id: string) {
    return CACHED_POSTS.get(post_id);
}

export { FetchPost, CachePost, GetCachedPost, CACHED_POSTS };
