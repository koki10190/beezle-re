import ReactDOMServer from "react-dom/server";
import ImageEmbed from "../Components/ImageEmbed";
import VideoEmbed from "../Components/VideoEmbed";
import React from "react";
import sanitize from "sanitize-html";
import PostBox from "../Components/PostBox";
import { FetchPost } from "./FetchPost";
import { fetchUserPublic } from "./fetchUserPublic";
import BeezleEmoji from "../Components/Emoji";
import { UserPublic } from "../types/User";
import "./ParseURLs.css";
import { Links, marked } from "marked";

function MentionHover({ handle }: { handle: string }) {
    return (
        <div className="hover-mention-container">
            <a>hello</a>
        </div>
    );
}

var render = new marked.Renderer();
render.link = function ({ href, title, text }) {
    return href;
};

render.br = function () {
    return "";
};

render.paragraph = function ({ tokens }) {
    let joined = "";
    for (const token of tokens) {
        joined += token.raw + " ";
    }
    return joined;
};

function parseURLs(content: string, self_user: UserPublic, embed = true, post_id = ""): string {
    if (!content) return "";
    let htmlToEmbed = "";
    content = sanitize(marked.parse(content, { renderer: render, breaks: false }) as string);
    // console.log(content);
    if (embed) {
        const matched = content.match(/\bhttps?:\/\/media\.tenor\.com\S+/gi);

        let i = 0;
        matched?.forEach((match) => {
            content = content.replace(match, "");
            if (i > 2) return;

            const isVideo = match.match(/.mp4|.wmv/gi) ? true : false;
            const embed = ReactDOMServer.renderToStaticMarkup(isVideo ? <VideoEmbed url={match} /> : <ImageEmbed url={match} />);
            htmlToEmbed += embed;
            i++;
        });
    }

    if (embed) {
        const matched = content.match(/\bhttps?:\/\/i\.tenor\.com\S+/gi);

        let i = 0;
        matched?.forEach((match) => {
            content = content.replace(match, "");
            if (i > 2) return;

            const isVideo = match.match(/.mp4|.wmv/gi) ? true : false;
            const embed = ReactDOMServer.renderToStaticMarkup(isVideo ? <VideoEmbed url={match} /> : <ImageEmbed url={match} />);
            htmlToEmbed += embed;
            i++;
        });
    }

    if (embed) {
        const matched = content.match(/\bhttps?:\/\/i\.imgur\.com\S+/gi);

        let i = 0;
        matched?.forEach((match) => {
            content = content.replace(match, "");
            if (i > 2) return;

            const isVideo = match.match(/.mp4|.wmv/gi) ? true : false;
            const embed = ReactDOMServer.renderToStaticMarkup(isVideo ? <VideoEmbed url={match} /> : <ImageEmbed url={match} />);
            htmlToEmbed += embed;
            i++;
        });

        const matched_catbox = content.match(/\bhttps?:\/\/files\.catbox\.moe\S+/gi);

        i = 0;
        matched_catbox?.forEach((match) => {
            content = content.replace(match, "");
            if (i > 2) return;

            const isVideo = match.match(/.mp4|.wmv/gi) ? true : false;
            const embed = ReactDOMServer.renderToStaticMarkup(isVideo ? <VideoEmbed url={match} /> : <ImageEmbed url={match} />);
            htmlToEmbed += embed;
            i++;
        });

        // /\bhttps?:\/\/files\.catbox\.moe\S+/gi;
    }

    if (embed) {
        if (content.match(/youtube\.com|youtu\.be/g)) {
            const matches = content.match(
                /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/gi,
            );
            matches?.forEach((match) => {
                // console.log("MATCH:", match);
                htmlToEmbed += match.replace(
                    /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/gi,
                    `<iframe style="width: 100%; min-height: 350px; border: none;" src="https://youtube.com/embed/$1"></iframe>`,
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
        .replace(
            /@([a-z\d_\.-]+)/gi,
            ReactDOMServer.renderToStaticMarkup(
                <a id={"mention-hover-$1-" + post_id} className="mention" href={"/profile/$1"}>
                    @{"$1"}
                </a>,
            ),
        )
        .replace(/#([A-Za-z0-9]+)/gi, `<a class="mention" href="/hashtag/$1">#$1</a>`);

    final = final.replace(/&lt;/g, "<");
    final = final.replace(/&gt;/g, ">");

    // LINKS
    {
        final = final.replace(
            /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gi,
            `<a class="mention" target="_blank" href="$&">$&</a>`,
        );
    }

    // EMOJI
    if (self_user) {
        const matches = final.match(/\<\:([^\:\>]+)\:\>/g);
        // console.log("Emoji matches", matches);
        matches?.forEach((match) => {
            const emoji_name = match.replace("<:", "").replace(":>", "");

            if (self_user.customization?.emojis) {
                self_user.customization.emojis.forEach((emoji) => {
                    if (emoji.id == emoji_name) {
                        final = final.replace(
                            new RegExp(`\\<\\:${emoji_name}\\:\\>`, "g"),
                            ReactDOMServer.renderToStaticMarkup(<BeezleEmoji user={self_user} src={emoji.imgUrl} emoji_name={emoji.id} />),
                        );
                    }
                });
            }
        });
    }

    // console.log("FINAL", final + (final.replace(/ /g, "") !== "" ? "<br/>" : "") + htmlToEmbed);
    return final.trimStart().trimEnd() + (final.replace(/ /g, "") !== "" ? "<br/>" : "") + htmlToEmbed;
}

export default parseURLs;
