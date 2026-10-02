import axios from "axios";

interface CatboxReturnType {
    error?: string;
    link: string;
}

async function UploadFileToCatbox(file: File): Promise<CatboxReturnType> {
    const formData = new FormData();

    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", file);

    const endpoint = "https://catbox.moe/user/api.php";

    let fileRes = await axios.post<string>(endpoint, formData);

    const rtrn = fileRes.data;

    return {
        error: rtrn.startsWith("https://") ? undefined : rtrn,
        link: rtrn.startsWith("https://") ? rtrn : "",
    };
}
export default UploadFileToCatbox;
