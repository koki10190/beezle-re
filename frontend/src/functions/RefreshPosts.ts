import axios from "axios";
import { api_uri } from "../links";
import GetFullAuth from "./GetFullAuth";

async function RefreshPosts(setPosts: any) {
    setPosts((await axios.get(`${api_uri}/api/post/get/explore`, GetFullAuth())).data);
}

export { RefreshPosts };
