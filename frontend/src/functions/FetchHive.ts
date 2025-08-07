import axios from "axios";
import { api_uri } from "../links";
import GetAuthToken from "./GetAuthHeader";

async function FetchHive(id: string): Promise<BeezleHives.Hive> {
    const res = await axios.get(`${api_uri}/api/hives/get`, {
        params: {
            handle: id,
        },
        headers: GetAuthToken(),
    });

    return res.data.hive;
}

export default FetchHive;
