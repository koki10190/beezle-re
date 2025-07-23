import axios from "axios";
import { FormEvent, LegacyRef, MouseEventHandler, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import "./PostTyper.css";
import { api_uri, tenor_api_key } from "../links";
import { Post } from "../types/Post";
import EmojiPicker, { Categories, Emoji, EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react";
import GifPicker, { GifPickerProps, TenorImage } from "gif-picker-react";
import ImageEmbed from "./ImageEmbed";
import ReactDOMServer from "react-dom/server";
import UploadToImgur from "../functions/UploadToImgur";
import UploadToImgurFile from "../functions/UploadToImgurByFile";
import UploadToImgurVideoByFile from "../functions/UploadToImgurVideoByFile";
import VideoEmbed from "./VideoEmbed";
import { UserPrivate } from "../types/User";
import { fetchUserPrivate } from "../functions/fetchUserPrivate";
import PostTyperVideoEmbed from "./PostTyperVideoEmbed";
import PostTyperImageEmbed from "./PostTyperImageEmbed";

interface FileType {
    file: File;
    isVideo: boolean;
}

function PostTyper({ onSend, replying_to = "" }: { onSend: (data: Post) => void; replying_to?: string }) {
    const textarea = useRef<HTMLTextAreaElement>(null);
    const [canCreate, setCanCreate] = useState(true);
    const [isEmojiPickerOpened, setEmojiPickerOpened] = useState(false);
    const [isTenorOpened, setTenorOpened] = useState(false);
    const [files, setFiles] = useState([] as Array<FileType>);
    const fileRef = useRef<HTMLInputElement>(null);
    const filesToUploadRef = useRef<HTMLDivElement>(null);
    const sendButtonRef = useRef<HTMLButtonElement>(null);
    const charCounter = useRef<HTMLParagraphElement>(null);
    const [self_user, setSelfUser] = useState<UserPrivate>();

    useEffect(() => {
        (async () => {
            setSelfUser(await fetchUserPrivate());
        })();
    }, []);

    const CreatePost = () => {
        (async () => {
            let links = "";
            for (const file of files) {
                sendButtonRef.current!.disabled = true;
                sendButtonRef.current!.innerText = "Posting...";
                let vid = await UploadToImgurVideoByFile(file.file);
                if (!vid) {
                    sendButtonRef.current!.disabled = false;
                    sendButtonRef.current!.innerText = "Send";
                    return;
                }
                console.log(vid);
                links += file.isVideo ? vid.data.link + " " : (await UploadToImgurFile(file.file)).data.link + " ";
            }

            if (!textarea.current || !canCreate || (textarea.current.value.replace(/ /g, "") == "" && links == "")) {
                sendButtonRef.current!.disabled = false;
                sendButtonRef.current!.innerText = "Send";
                return;
            }
            // if (textarea.current.value.replace(/ /g, '') == '') return;
            sendButtonRef.current!.disabled = true;
            sendButtonRef.current!.innerText = "Posting...";

            const res = await axios.post(`${api_uri}/api/post/create`, {
                token: localStorage.getItem("access_token"),
                content: textarea.current.value + " " + links,
                replying_to,
                is_reply: replying_to !== "",
            });

            console.log(res.data);
            onSend(res.data as Post);
            setCanCreate(false);
            textarea.current.value = "";

            setFiles([]);

            sendButtonRef.current!.disabled = false;
            sendButtonRef.current!.innerText = "Send";

            setTimeout(() => {
                setCanCreate(true);
            }, 7 * 1000); // 5s
        })();
    };

    const UploadImage = (e: any) => {
        const target = filesToUploadRef.current!;
        const files = fileRef.current!.files as FileList;
        const link = window.URL.createObjectURL(files[0]);
        const ext = files[0].type;
        const isVideo = ext.match(/mp4|wmv/gi) ? true : false;
        setFiles((old) => [
            ...old,
            {
                file: files[0],
                isVideo,
            },
        ]);
        // target.innerHTML += ReactDOMServer.renderToStaticMarkup(isVideo ? <VideoEmbed url={link} /> : <ImageEmbed url={link} />);
    };

    const PasteImage = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const item = e.clipboardData.items[0];

        if (item.type.indexOf("image") === 0 || item.type.indexOf("video") === 0) {
            e.preventDefault();
            const blob = item.getAsFile();

            // const fileFormData = new FormData();
            // fileFormData.append("file", blob);

            const link = window.URL.createObjectURL(blob);
            const ext = blob.type;
            const isVideo = ext.match(/mp4|wmv/gi) ? true : false;
            setFiles((old) => [
                ...old,
                {
                    file: blob,
                    isVideo,
                },
            ]);
        }
    };

    return (
        <div>
            <textarea
                onPaste={PasteImage}
                minLength={1}
                maxLength={300}
                ref={textarea}
                placeholder="Press here to type."
                className="post-typer"
            ></textarea>
            <div ref={filesToUploadRef} className="files-to-upload">
                {files.map((file, index) =>
                    file.isVideo ? (
                        <PostTyperVideoEmbed
                            setFiles={setFiles}
                            index={index}
                            key={window.URL.createObjectURL(file.file)}
                            url={window.URL.createObjectURL(file.file)}
                        />
                    ) : (
                        <PostTyperImageEmbed
                            setFiles={setFiles}
                            index={index}
                            key={window.URL.createObjectURL(file.file)}
                            url={window.URL.createObjectURL(file.file)}
                        />
                    ),
                )}
            </div>
            <div className="post-typer-buttons">
                <a onClick={() => fileRef.current!.click()} className="post-typer-button">
                    <i className="fa-solid fa-image" />
                </a>
                <input onChange={UploadImage} accept=".jpeg,.gif,.png,.jpg,.mp4" ref={fileRef} type="file" style={{ display: "none" }} />
                <a
                    onClick={() => {
                        setEmojiPickerOpened(!isEmojiPickerOpened);
                        setTenorOpened(false);
                    }}
                    className="post-typer-button"
                >
                    <i className="fa-solid fa-face-awesome" />
                </a>
                <a
                    onClick={() => {
                        setTenorOpened(!isTenorOpened);
                        setEmojiPickerOpened(false);
                    }}
                    className="post-typer-button"
                >
                    <i className="fa-solid fa-gif" />
                </a>
                <button ref={sendButtonRef} onClick={CreatePost} className="post-typer-button button-field post-typer-sender">
                    Send
                </button>
            </div>
            {isEmojiPickerOpened ? (
                <EmojiPicker
                    onEmojiClick={(emojiData: EmojiClickData, event: MouseEvent) => {
                        textarea.current!.value += emojiData.isCustom ? `<:${emojiData.emoji}:> ` : emojiData.emoji;
                    }}
                    customEmojis={self_user?.customization?.emojis ? self_user?.customization?.emojis : []}
                    theme={Theme.DARK}
                    emojiStyle={EmojiStyle.NATIVE}
                    className="post-typer-emoji-picker"
                />
            ) : (
                ""
            )}
            {isTenorOpened ? (
                <GifPicker
                    onGifClick={(gif: TenorImage) => {
                        textarea.current!.value += ` ${gif.url}`;
                    }}
                    tenorApiKey={tenor_api_key}
                    theme={Theme.DARK}
                />
            ) : (
                ""
            )}
        </div>
    );
}

export default PostTyper;
