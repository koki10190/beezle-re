import { useState } from "react";

function VideoEmbed({ url }: { url: string }) {
    // useEffect(() => {
    // }, []);
    return (
        <video className="post-video-embed" controls>
            <source src={url} type="video/mp4" />
            <source src={url} type="video/ogg" />
        </video>
    );
}

export default VideoEmbed;
