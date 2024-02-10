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

    {
        if (content.match(/youtube\.com|youtu\.be/g)) {
            const matches = content.match(
                /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/g
            );

            matches.forEach(match => {
                htmlToEmbed += match.replace(
                    /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/g,
                    `<iframe style="width: 100%; min-height: 350px; border: none;" src="https://youtube.com/embed/$1"></iframe>`
                );
            });
        }
    }

    const final = sanitize(content)
        .replace(/@([a-z\d_\.-]+)/gi, `<a class="mention" href="/profile/$1">@$1</a>`)
        .replace(
            /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/g,
            ``
        );
    return final + (final.replace(/ /g, "") !== "" ? "<br/>" : "") + htmlToEmbed;
}

export default parseURLs;
