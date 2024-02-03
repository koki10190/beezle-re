import axios from "axios";
import { api_uri } from "../links";
import { Post } from "../types/Post";

async function FetchPost(post_id: string): Promise<Post> {
    return (await axios.get(`${api_uri}/api/post/get/one?post_id=${post_id}`)).data as Post;
}

export default FetchPost;
