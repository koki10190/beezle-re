import axios from "axios";

async function UploadToImgurVideoByFile(file: File) {
    console.log("afasdf");
    let formData = new FormData();
    formData.append("image", file);

    console.log(formData);

    try {
        const res = await axios.post("https://api.imgur.com/3/upload", formData, {
            headers: {
                Authorization: "Client-ID cd2bc7a0a6fcd47",
            },
        });

        return res.data;
    } catch (e) {
        console.log(e);
    }
}

export default UploadToImgurVideoByFile;
