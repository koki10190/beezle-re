import { useState } from "react";

function PostTyperImageEmbed({
    url,
    setFiles,
    index,
}: {
    url: string;
    setFiles: React.Dispatch<React.SetStateAction<{ file: File; isVideo: boolean }[]>>;
    index: number;
}) {
    const getMeta = (url: string, cb: any) => {
        const img = new Image();
        img.onload = () => cb(null, img);
        img.onerror = (err) => cb(err);
        img.src = url;
    };

    const [size, setSize] = useState({
        width: "100px",
        height: "100px",
    });

    const removeEmbed = () => {
        setFiles((old) => {
            const new_arr = [...old];
            new_arr.splice(index, 1);
            return new_arr;
        });
    };

    getMeta(url, (err: string | Event, img: HTMLImageElement) => {
        setSize({
            width: `${img.naturalWidth}px`,
            height: `${img.naturalHeight}px`,
        });
    });
    // useEffect(() => {
    // }, []);
    return (
        <div style={{ width: size.width, height: size.height, backgroundImage: `url(${url})` }} className="post-image-embed">
            <a onClick={removeEmbed} className="post-image-embed-button">
                <i className="fa-solid fa-x"></i>
            </a>
        </div>
    );
}

export default PostTyperImageEmbed;
