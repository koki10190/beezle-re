import { useState } from "react";
import SetFilesType from "../types/setFilesType";

function PostTyperAudioEmbed({ url, setFiles, index }: { url: string; setFiles: SetFilesType; index: number }) {
    const removeEmbed = () => {
        setFiles((old) => {
            const new_arr = [...old];
            new_arr.splice(index, 1);
            return new_arr;
        });
    };

    return (
        <>
            <div className="post-typer-audio-embed">
                <a onClick={removeEmbed} target="_blank" className="post-audio-embed-button">
                    <i className="nf nf-oct-x"></i>
                </a>
                <audio className="post-audio-embed" controls>
                    <source src={url} />
                </audio>
            </div>
        </>
    );
}

export default PostTyperAudioEmbed;
