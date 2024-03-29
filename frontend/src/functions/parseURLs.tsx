import ReactDOMServer from "react-dom/server";
import ImageEmbed from "../Components/ImageEmbed";
import VideoEmbed from "../Components/VideoEmbed";
import React from "react";
import sanitize from "sanitize-html";
import PostBox from "../Components/PostBox";
import FetchPost from "./FetchPost";
import { fetchUserPublic } from "./fetchUserPublic";
import BeezleEmoji from "../Components/Emoji";
import { UserPublic } from "../types/User";

function parseURLs(content: string, self_user: UserPublic): string {
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
    //             const self_user = await fetchUserPublic();
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

    let final = sanitize(content)
        .replace(/@([a-z\d_\.-]+)/gi, `<a class="mention" href="/profile/$1">@$1</a>`)
        .replace(
            /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/g,
            ``
        );

    final = final.replace(/&lt;/g, "<");
    final = final.replace(/&gt;/g, ">");

    // EMOJI
    if (self_user) {
        const matches = final.match(/\<\:([^\:\>]+)\:\>/g);
        console.log("Emoji matches", matches);
        matches?.forEach(match => {
            console.log("Matched something", match);
            const emoji_name = match.replace("<:", "").replace(":>", "");

            if (self_user.customization?.emojis) {
                self_user.customization.emojis.forEach(emoji => {
                    if (emoji.id == emoji_name) {
                        final = final.replace(
                            new RegExp(`\\<\\:${emoji_name}\\:\\>`, "g"),
                            ReactDOMServer.renderToStaticMarkup(
                                <BeezleEmoji user={self_user} src={emoji.imgUrl} emoji_name={emoji.id} />
                            )
                        );
                    }
                });
            }
        });
    }
    console.log("FINAL", final + (final.replace(/ /g, "") !== "" ? "<br/>" : "") + htmlToEmbed);
    return final + (final.replace(/ /g, "") !== "" ? "<br/>" : "") + htmlToEmbed;
}

export default parseURLs;
