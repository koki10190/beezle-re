import { useState } from "react";

function ImageEmbed({ url }: { url: string }) {
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

    getMeta(url, (err: string | Event, img: HTMLImageElement) => {
        setSize({
            width: `${img?.naturalWidth ?? 0}px`,
            height: `${img?.naturalHeight ?? 0}px`,
        });
    });
    // useEffect(() => {
    // }, []);
    return (
        <div style={{ width: size.width, marginTop: "10px", height: size.height, backgroundImage: `url(${url})` }} className="post-image-embed">
            <a href={url} download={`image.${url.split(".")[url.split(".").length - 1]}`} target="_blank" className="post-image-embed-button">
                <i className="fa-solid fa-download"></i>
            </a>
        </div>
    );
}

export default ImageEmbed;
