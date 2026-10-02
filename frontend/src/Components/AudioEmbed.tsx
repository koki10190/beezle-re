import { useState } from "react";

function AudioEmbed({ url }: { url: string }) {
    // useEffect(() => {
    // }, []);
    return (
        <audio className="post-audio-embed" controls>
            <source src={url} />
        </audio>
    );
}

export default AudioEmbed;
