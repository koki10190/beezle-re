import axios from "axios";
import { toast } from "react-toastify";
import GetFullAuth from "./GetFullAuth";
import { api_uri } from "../links";

async function UploadToImgurFile(file: File) {
    let formData = new FormData();
    formData.append("image", file);

    console.log(formData);

    try {
        const res = await axios.post("https://api.imgur.com/3/image", formData, {
            headers: {
                Authorization: "Client-ID cd2bc7a0a6fcd47",
            },
        });
        if (typeof res.data === "string") throw "Faggot";
        return res.data;
    } catch (e) {
        try {
            const res = await axios.post(`${api_uri}/api/file/upload`, formData, GetFullAuth());
            if (typeof res.data === "string") throw "Faggot";
            return res.data;
        } catch (_) {
            toast.error("Couldn't Upload Image/Video to Imgur: " + e + " | " + _);
            console.log(e, _);
        }
        return null;
    }
}

export default UploadToImgurFile;
