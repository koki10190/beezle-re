import ReactDOMServer from "react-dom/server";
import ImageEmbed from "../Components/ImageEmbed";
import VideoEmbed from "../Components/VideoEmbed";
import React from "react";
import sanitize from "sanitize-html";
import PostBox from "../Components/PostBox";
import FetchPost from "./FetchPost";
import { fetchUserPrivate } from "./fetchUserPrivate";

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

    // {
    //     const matches = content.match(/\bhttp?:\/\/10\.106\.31\.90:5173\S+/gi);
    //     console.log(matches);
    //     if (matches) {
    //         matches.forEach(async match => {
    //             const self_user = await fetchUserPrivate();
    //             const post_id = match.split("/post/")[1];
    //             const post = await FetchPost(post_id);
    //             console.log("POST_QUOTE:", post);
    //             htmlToEmbed += ReactDOMServer.renderToStaticMarkup(
    //                 <PostBox self_user={self_user} post={post} setPosts={null} />
    //             );
    //             console.log("TOEMBED", htmlToEmbed);
    //         });
    //     }
    // }

    const final = sanitize(content)
        .replace(/@([a-z\d_\.-]+)/gi, `<a class="mention" href="/profile/$1">@$1</a>`)
        .replace(
            /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/g,
            ``
        );
    console.log("FINAL", final + (final.replace(/ /g, "") !== "" ? "<br/>" : "") + htmlToEmbed);
    return final + (final.replace(/ /g, "") !== "" ? "<br/>" : "") + htmlToEmbed;
}

export default parseURLs;
