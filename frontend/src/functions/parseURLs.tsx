import ReactDOMServer from "react-dom/server";
import ImageEmbed from "../Components/ImageEmbed";
import VideoEmbed from "../Components/VideoEmbed";
import React from "react";
import sanitize from "sanitize-html";

function parseURLs(content: string): string {
    let htmlToEmbed = "";
    {
        const matched = content.match(/\bhttps?:\/\/media\.tenor\.com\S+/gi);

        let i = 0;
        matched?.forEach(match => {
            content = content.replace(match, "");
            if (i > 2) return;

            const isVideo = match.match(/.mp4|.wmv/gi) ? true : false;
            const embed = ReactDOMServer.renderToStaticMarkup(
                isVideo ? <VideoEmbed url={match} /> : <ImageEmbed url={match} />
            );
            htmlToEmbed += embed;
            i++;
        });
    }

    {
        const matched = content.match(/\bhttps?:\/\/i\.tenor\.com\S+/gi);

        let i = 0;
        matched?.forEach(match => {
            content = content.replace(match, "");
            if (i > 2) return;

            const isVideo = match.match(/.mp4|.wmv/gi) ? true : false;
            const embed = ReactDOMServer.renderToStaticMarkup(
                isVideo ? <VideoEmbed url={match} /> : <ImageEmbed url={match} />
            );
            htmlToEmbed += embed;
            i++;
        });
    }

    {
        const matched = content.match(/\bhttps?:\/\/i\.imgur\.com\S+/gi);

        let i = 0;
        matched?.forEach(match => {
            content = content.replace(match, "");
            if (i > 2) return;

            const isVideo = match.match(/.mp4|.wmv/gi) ? true : false;
            const embed = ReactDOMServer.renderToStaticMarkup(
                isVideo ? <VideoEmbed url={match} /> : <ImageEmbed url={match} />
            );
            htmlToEmbed += embed;
            i++;
        });
    }

    return sanitize(content) + "<br/>" + htmlToEmbed;
}

export default parseURLs;
