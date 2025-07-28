import axios from "axios";

async function UploadToImgur(input: HTMLInputElement) {
    let formData = new FormData();
    formData.append("image", input.files![0]);

    console.log(formData);

    try {
        const res = await axios.post("https://api.imgur.com/3/image", formData, {
            headers: {
                Authorization: "Client-ID cd2bc7a0a6fcd47",
            },
        });

        return res.data;
    } catch (e) {
        console.log(e);
    }
}

export default UploadToImgur;
