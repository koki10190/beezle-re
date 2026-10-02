import { useState } from "react";
import FileTypeEnum from "../types/FileTypeEnum";
import SetFilesType from "../types/setFilesType";

function PostTyperVideoEmbed({ url, setFiles, index }: { url: string; setFiles: SetFilesType; index: number }) {
    const removeEmbed = () => {
        setFiles((old) => {
            const new_arr = [...old];
            new_arr.splice(index, 1);
            return new_arr;
        });
    };

    return (
        <>
            <div className="post-typer-video-embed">
                <a onClick={removeEmbed} target="_blank" className="post-video-embed-button">
                    <i className="nf nf-oct-x"></i>
                </a>
                <video className="post-video-embed" controls>
                    <source src={url} type="video/mp4" />
                    <source src={url} type="video/ogg" />
                </video>
            </div>
        </>
    );
}

export default PostTyperVideoEmbed;
