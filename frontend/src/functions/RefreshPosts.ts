import axios from "axios";
import { api_uri } from "../links";

async function RefreshPosts(setPosts: any) {
    setPosts((await axios.get(`${api_uri}/api/post/get/explore`)).data);
}

export { RefreshPosts };
