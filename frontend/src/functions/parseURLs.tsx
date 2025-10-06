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
import { Post } from "../types/Post";
import FetchHive from "./FetchHive";
import twemoji from "twemoji";

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

function parseURLs(
    content: string,
    self_user: UserPublic,
    embed = true,
    post_id = "",
    navigate = (_: string) => {
        window.location.href = _;
    },
): string {
    if (!content) return "";
    let htmlToEmbed = "";
    content = content.startsWith("{MARKDOWN}")
        ? sanitize(marked.parse(content.replace(/\{MARKDOWN\}/, ""), { renderer: render, breaks: false }) as string)
        : sanitize(content);
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

        if (
            content.match(
                /(https?:\/\/open.spotify.com\/(track|user|artist|album)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/gi,
            )
        ) {
            const matches = content.match(
                /(https?:\/\/open.spotify.com\/(track|user|artist|album)\/[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)|spotify:(track|user|artist|album):[a-zA-Z0-9]+(:playlist:[a-zA-Z0-9]+|))/gi,
            );
            let i = 0;
            matches?.forEach((match) => {
                if (i > 3) return;
                const track_id = match.replace(/(https?:\/\/open.spotify.com\/(track|user|artist|album))/gi, "");
                const type = GetSpotifyLinkType(match);
                htmlToEmbed += `<iframe style="width: 100%; height: fit-content; border:none; margin-bottom: -75px; margin-top: 5px" src="https://open.spotify.com/embed/${type}/${track_id}"></iframe>`;
                // https://open.spotify.com/embed/track/0ycChASwBZkWJDgF3tOfvb?utm_source=discord&utm_medium=desktop
                i++;
            });
        }
    }
    let final = sanitize(content)
        .replace(
            /@([a-z\d_\.-]+)/gi,
            ReactDOMServer.renderToStaticMarkup(
                <a id={"mention-hover-$1-" + post_id} className="mention" href="/profile/$1">
                    @{"$1"}
                </a>,
            ),
        )
        .replace(
            /#([A-Za-z0-9]+)/gi,
            ReactDOMServer.renderToStaticMarkup(
                <a className="mention" href={"/hashtag/$1"}>
                    #{"$1"}
                </a>,
            ),
        );

    //`<a class="mention" href="/hashtag/$1">#$1</a>`);

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

enum SpotifyLinkType {
    NONE = "none",
    TRACK = "track",
    ALBUM = "album",
    PLAYLIST = "playlist",
    ARTIST = "artist",
    USER = "user",
}
function GetSpotifyLinkType(url: string) {
    if (url.includes("track")) return SpotifyLinkType.TRACK;
    if (url.includes("album")) return SpotifyLinkType.ALBUM;
    if (url.includes("user")) return SpotifyLinkType.USER;
    if (url.includes("artist")) return SpotifyLinkType.ARTIST;
    if (url.includes("playlist")) return SpotifyLinkType.PLAYLIST;
    return SpotifyLinkType.NONE;
}

async function ExtractBeezlePostFromLinks(content: string): Promise<Array<Post>> {
    const posts: Array<Post> = [];
    let regex = /https:\/\/beezle\.lol\/post\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/gi;
    const matches = content.match(regex) ?? [];
    for (const link of matches) {
        const uuid = link.replace("https://beezle.lol/post/", "");
        const post = await FetchPost(uuid);

        if (!post) continue;

        posts.push(post);
    }
    return posts;
}

// TODO: HIVE CUSTOMIZATION
async function ExtractHivesFromLinks(content: string): Promise<Array<BeezleHives.Hive>> {
    const hives: Array<BeezleHives.Hive> = [];
    let regex = /https:\/\/beezle\.lol\/hive\/[a-zA-Z0-9_.-]*/gi;
    const matches = content.match(regex) ?? [];
    for (const hive_id of matches) {
        const uuid = hive_id.replace("https://beezle.lol/hive/", "");
        const hive = await FetchHive(uuid);

        if (!hive) continue;

        hives.push(hive);
    }
    return hives;
}

export default parseURLs;
export { ExtractBeezlePostFromLinks, ExtractHivesFromLinks };
