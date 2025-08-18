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
import { fetchUserPrivate, GetUserPrivate } from "../functions/fetchUserPrivate";
import PostTyperVideoEmbed from "./PostTyperVideoEmbed";
import PostTyperImageEmbed from "./PostTyperImageEmbed";
import GetAuthToken from "../functions/GetAuthHeader";
import { toast } from "react-toastify";
import FullPopup from "./Popups/FullPopup";
import { TIME_OPTIONS } from "../types/TIMEDATA";
import Divider from "./Divider";
import Poll from "./Poll";
import Twemoji from "react-twemoji";
import ReactEmojiTextArea from "@nikaera/react-emoji-textarea";

interface FileType {
    file: File;
    isVideo: boolean;
}

function PostTyper({ onSend, replying_to = "", hive_post = null }: { onSend: (data: Post) => void; replying_to?: string; hive_post?: string }) {
    const textarea = useRef<HTMLTextAreaElement>(null);
    const [canCreate, setCanCreate] = useState(true);
    const [isEmojiPickerOpened, setEmojiPickerOpened] = useState(false);
    const [isTenorOpened, setTenorOpened] = useState(false);
    const [isPollOpened, setPollOpened] = useState(false);
    const [files, setFiles] = useState([] as Array<FileType>);
    const fileRef = useRef<HTMLInputElement>(null);
    const filesToUploadRef = useRef<HTMLDivElement>(null);
    const sendButtonRef = useRef<HTMLButtonElement>(null);
    const charCounter = useRef<HTMLParagraphElement>(null);
    const [self_user, setSelfUser] = useState<UserPrivate>();
    const [pollData, setPollData] = useState<{
        title: string;
        temp_option_holder: string;
        options: Array<string>;
        days: number;
        hours: number;
        minutes: number;
    }>({
        title: "",
        temp_option_holder: "",
        options: [],
        days: 0,
        hours: 0,
        minutes: 0,
    });
    const [poll, setPoll] = useState<{
        options: Array<string>;
        title: string;
        expiry_s: number;
    }>(null);

    useEffect(() => {
        (async () => {
            setSelfUser(await fetchUserPrivate());
        })();
    }, []);

    const CreatePost = () => {
        if (self_user?.is_bot) {
            return toast.error("Bot Accounts cannot use the site!");
        }
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
                if (vid.data.link == undefined) {
                    toast.error("There was an error uploading the image using a fallback: " + vid.data.error);
                    continue;
                }
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
            console.log(poll);
            const res = await axios.post(
                `${api_uri}/api/post/create`,
                {
                    content: textarea.current.value + " " + links,
                    replying_to,
                    is_reply: replying_to !== "",
                    hive_post,
                    poll,
                },
                {
                    headers: GetAuthToken(),
                },
            );

            console.log(res.data);
            res.data.post_reactions = [];
            res.data.reply_count = 0;
            onSend(res.data as Post);
            setCanCreate(false);
            textarea.current.value = "";

            setFiles([]);
            setPoll(null);

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

    const AddOption = () => {
        setPollData((old) => {
            if (old.options.length >= 5) return old;
            // if (old.options.findIndex((x) => x === old.temp_option_holder) > -1) return old;
            const _new = { ...old };
            _new.options.push(_new.temp_option_holder);
            _new.temp_option_holder = "";
            return _new;
        });
    };

    const CreatePoll = () => {
        console.log(pollData);
        let seconds = pollData.days * 86400;
        seconds += pollData.hours * 3600;
        seconds += pollData.minutes * 60;
        console.log(seconds, "S");
        if (pollData.title.length < 1) {
            toast.error("Cannot have an empty title!");
            return;
        }

        if (pollData.options.length < 1) {
            toast.error("A poll must have atleast one option!");
            return;
        }

        if (seconds < 5) {
            toast.error("Invalid time!");
            return;
        }

        toast.success("Success!");
        setPoll({
            options: pollData.options,
            title: pollData.title,
            expiry_s: seconds,
        });
    };

    const RemoveOption = (index: number) => {
        setPollData((old) => {
            const _new = { ...old };

            _new.options.splice(index, 1);
            return _new;
        });
    };

    useEffect(() => {
        textarea.current.className = "post-typer textarea-field-sizing";
        textarea.current.parentElement.style.width = "100%";
    }, [textarea.current]);

    return (
        <div>
            <textarea
                onPaste={PasteImage}
                minLength={1}
                maxLength={300}
                ref={textarea}
                placeholder="Press here to type."
                className="post-typer noto-emoji-google"
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
            {poll ? (
                <div>
                    <h2>
                        Poll will be uploaded -{" "}
                        <span onClick={() => setPoll(null)} className="poll-remover">
                            REMOVE
                        </span>
                    </h2>
                </div>
            ) : (
                ""
            )}
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
                <a
                    onClick={() => {
                        setPollOpened(!isPollOpened);
                    }}
                    className="post-typer-button"
                >
                    <i className="fa-solid fa-poll-people" />
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
                    emojiStyle={EmojiStyle.TWITTER}
                    emojiVersion=""
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

            {isPollOpened ? (
                <FullPopup>
                    <h1 style={{ marginTop: "10px", marginBottom: "5px" }}>
                        <i className="fa-solid fa-square-poll-vertical"></i> Poll Creator
                    </h1>
                    <label htmlFor="cpoll-title">Poll Title</label>
                    <input
                        onChange={(v) => {
                            setPollData((old) => {
                                const _new = { ...old };
                                _new.title = v.target.value;
                                return _new;
                            });
                        }}
                        value={pollData.title}
                        id="cpoll-title"
                        className="input-field w100"
                        placeholder="Which one is better..."
                    />
                    <div className="cpoll-date">
                        <select
                            onChange={(v) => {
                                setPollData((old) => {
                                    const _new = { ...old };
                                    _new.days = parseInt(v.target.value);
                                    return _new;
                                });
                            }}
                            className="input-field"
                        >
                            <option value="" disabled selected>
                                Days
                            </option>
                            {TIME_OPTIONS.days.map((day) => (
                                <option selected={day === pollData.days && day != 0} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                        <select
                            onChange={(v) => {
                                setPollData((old) => {
                                    const _new = { ...old };
                                    _new.hours = parseInt(v.target.value);
                                    return _new;
                                });
                            }}
                            className="input-field"
                        >
                            <option value="" disabled selected>
                                Hours
                            </option>
                            {TIME_OPTIONS.hours.map((v) => (
                                <option selected={v === pollData.hours && v != 0} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>
                        <select
                            onChange={(v) => {
                                setPollData((old) => {
                                    const _new = { ...old };
                                    _new.minutes = parseInt(v.target.value);
                                    return _new;
                                });
                            }}
                            className="input-field"
                        >
                            <option value="" disabled selected>
                                Minutes
                            </option>
                            {TIME_OPTIONS.minutes.map((v) => (
                                <option selected={v === pollData.minutes && v != 0} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </div>
                    <hr
                        style={{
                            width: "calc(100% + 20px)",
                            marginLeft: "-10px",
                            borderTop: "1px solid rgba(255, 255,255, 0.4)",
                        }}
                        className="divider"
                    ></hr>
                    <h3 style={{ marginTop: "10px", marginBottom: "10px" }}>
                        <i className="fa-solid fa-bars-progress"></i> Poll Options
                    </h3>
                    <label htmlFor="cpoll-option-title">Option</label>
                    <input
                        onChange={(v) => {
                            setPollData((old) => {
                                const _new = { ...old };
                                _new.temp_option_holder = v.target.value;
                                return _new;
                            });
                        }}
                        value={pollData.temp_option_holder}
                        id="cpoll-option-title"
                        className="input-field w100"
                        placeholder="Bees are better"
                    />
                    <button onClick={AddOption} className="button-field button-field-blurple">
                        Add Option
                    </button>
                    <div>
                        {pollData.options.map((option, i) => {
                            return (
                                <div className="cpoll-option">
                                    <p className="cpoll-option-text">{option}</p>
                                    <button onClick={() => RemoveOption(i)} className="button-field button-field-red">
                                        <i className="fa-solid fa-delete-left"></i>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <hr
                        style={{
                            width: "calc(100% + 20px)",
                            marginLeft: "-10px",
                            borderTop: "1px solid rgba(255, 255,255, 0.4)",
                        }}
                        className="divider"
                    ></hr>
                    <div className="cpoll-decider-grid">
                        <button onClick={CreatePoll} className="button-field button-field-green">
                            Create
                        </button>
                        <button onClick={() => setPollOpened(false)} className="button-field button-field-red">
                            Close
                        </button>
                    </div>
                </FullPopup>
            ) : (
                ""
            )}
        </div>
    );
}

export default PostTyper;
