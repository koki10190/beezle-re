import axios from "axios";

import ReactDOMServer from "react-dom/server";
import React, { useEffect, useRef, useState, UIEvent, forwardRef } from "react";
import { UserPrivate, UserPublic } from "../../types/User";
import { fetchUserPublic } from "../../functions/fetchUserPublic";
import { fetchUserPrivate } from "../../functions/fetchUserPrivate";
import "./DMs.css";
import FollowBox from "../../Components/FollowBox";
import DmUserBox from "./DMUserBox";
import { AVATAR_SHAPES } from "../../types/cosmetics/AvatarShapes";
import moment from "moment";
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react";
import { api_uri, dm_uri, server_uri, tenor_api_key } from "../../links";
import GifPicker, { TenorImage } from "gif-picker-react";
import parseURLs from "../../functions/parseURLs";
import { useNavigate } from "react-router-dom";
import Divider from "../../Components/Divider";
import { io } from "socket.io-client";
import dmSocket from "../../types/DM";
import GetFullAuth from "../../functions/GetFullAuth";
import Peer, { MediaConnection } from "peerjs";
import { toast } from "react-toastify";
import DmPageAddFriend from "./Components/DmPageAddFriend";
import DmPageCreateGC from "./Components/DmPageCreateGC";
import ringtone from "./ringtone.mp3";
import chatNotif from "./chat-notif.mp3";
import GetAuthToken from "../../functions/GetAuthHeader";
import Username from "../../Components/Username";
import UploadToImgurVideoByFile from "../../functions/UploadToImgurVideoByFile";
import { fetchGroupChat } from "../../functions/fetchGroupChat";
import DmEditGC from "./Components/DmEditGC";
import DmEditGCMember from "./Components/DmEditGCMember";
import sanitize from "sanitize-html";

function truncate(input: string, length: number) {
    if (input.length > length) {
        return input.substring(0, length) + "...";
    }
    return input;
}

function TyperEmbed({ isVid, url, onXClick }: { onXClick: any; isVid: boolean; url: string }) {
    return (
        <>
            {isVid ? (
                <div className="dm-typer-embed">
                    <video style={{ width: "100%", height: "100%" }} controls>
                        <source src={url} type="video/mp4" />
                        <source src={url} type="video/ogg" />
                    </video>
                    <a onClick={onXClick} className="dm-typer-embed-button">
                        <i className="fa-solid fa-x"></i>
                    </a>
                </div>
            ) : (
                <div style={{ backgroundImage: `url(${url})` }} className="dm-typer-embed">
                    <a onClick={onXClick} className="dm-typer-embed-button">
                        <i className="fa-solid fa-x"></i>
                    </a>
                </div>
            )}
        </>
    );
}

function Message({
    msg,
    self_user,
    EditMessage,
    DeleteMessage,
    setTyperReplyer,
}: {
    msg: BeezleDM.Message;
    self_user: UserPrivate;
    EditMessage: (arg0: string, arg1: string) => void;
    DeleteMessage: (arg0: string) => void;
    setTyperReplyer: any;
}) {
    const [user, setUser] = useState<UserPublic>();
    const [parentHovered, setParentHovered] = useState(false);
    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(msg.content);
    const [content, setContent] = useState(msg.content);
    const [replyingTo, setReplyingTo] = useState<BeezleDM.Message>(null);

    useEffect(() => {
        (async () => {
            setUser(await fetchUserPublic(msg.author));

            if (msg.replying_to) {
                const reply_msg = await axios.get(`https://${server_uri}/message/${msg.replying_to}`, {
                    headers: GetAuthToken(),
                });
                if (reply_msg.data) {
                    setReplyingTo(reply_msg.data);
                }
            }
        })();
    }, []);

    useEffect(() => {
        setContent(msg.content);
    }, [msg.content]);

    const Delete = () => {
        dmSocket.emit("delete-message", msg.msg_id);
        DeleteMessage(msg.msg_id);
    };

    const Edit_SaveChanges = () => {
        setEditing(false);
        setContent(editedContent);
        console.log("Saved Changes, emitting", "edit-message", msg.msg_id, editedContent);
        dmSocket.emit("edit-message", msg.msg_id, editedContent);
        msg.edited = true;
        EditMessage(msg.msg_id, editedContent);
    };

    return (
        <div
            id={`dm-message-${msg.msg_id}`}
            onMouseEnter={() => setParentHovered(true)}
            onMouseLeave={() => setParentHovered(false)}
            className="dm-message"
        >
            {msg.edited ? (
                <a className="dm-attrib">
                    <i className="fa-solid fa-pencil" /> Edited
                </a>
            ) : null}
            {replyingTo ? (
                <a
                    onClick={() => {
                        const e = document.getElementById(`dm-message-${replyingTo.msg_id}`);
                        console.log(e);
                        e.setAttribute("tabindex", "0");
                        e.focus();
                    }}
                    className="dm-attrib"
                >
                    <i className="fa-solid fa-reply" /> Replying to {truncate(replyingTo.content, 24)}
                </a>
            ) : null}
            <div className="dm-msg-author">
                {parentHovered ? (
                    <div className="dm-msg-edit-panel">
                        <a
                            onClick={() => {
                                setTyperReplyer(msg);
                            }}
                            className="dm-msg-edit-panel-btn"
                        >
                            <i className="fa-solid fa-reply"></i>
                        </a>
                        {user?.handle === self_user?.handle ? (
                            <>
                                <a onClick={() => setEditing((old) => !old)} className="dm-msg-edit-panel-btn">
                                    <i className="fa-solid fa-pencil"></i>
                                </a>
                                <a onClick={Delete} className="dm-msg-edit-panel-btn dm-msg-edit-panel-btn-red">
                                    <i className="fa-solid fa-trash"></i>
                                </a>
                            </>
                        ) : null}
                    </div>
                ) : (
                    ""
                )}
                <div
                    style={{
                        backgroundImage: `url(${user?.avatar})`,
                        clipPath: AVATAR_SHAPES[user?.customization?.square_avatar] ? AVATAR_SHAPES[user?.customization?.square_avatar].style : "",
                        borderRadius:
                            AVATAR_SHAPES[user?.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                                ? user?.customization?.square_avatar
                                    ? "5px"
                                    : "100%"
                                : "100%",
                    }}
                    className="avatar"
                ></div>
                <p className="username">
                    {user?.username}
                    {/* <span className="dm-timestamp">{moment(new Date(parseInt((msg.timestamp as any).$date.$numberLong))).fromNow()}</span> */}
                </p>
                <p className="handle">@{user?.handle}</p>
            </div>
            {editing ? (
                <>
                    <textarea
                        placeholder="Edit Post"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="input-field"
                    ></textarea>
                    <button onClick={Edit_SaveChanges} style={{ marginTop: "10px" }} className="button-field shadow fixed-100">
                        Save Changes
                    </button>
                </>
            ) : (
                <>
                    <p
                        key={"dm-message-content-" + content}
                        dangerouslySetInnerHTML={{
                            __html: parseURLs(content, user, true, Math.random().toString(), navigate),
                        }}
                        className="dm-content"
                    ></p>
                </>
            )}
        </div>
    );
}

interface CallUserProps {
    user: BeezleCallUser;
}
const CallUser = forwardRef<HTMLVideoElement, CallUserProps>((props: CallUserProps, ref) => {
    return (
        <div id={"dm-call-" + props.user.user?.handle}>
            <div
                style={{
                    backgroundImage: `url(${props.user?.user?.avatar})`,
                    clipPath: AVATAR_SHAPES[props.user?.user?.customization?.square_avatar]
                        ? AVATAR_SHAPES[props.user?.user?.customization?.square_avatar].style
                        : "",
                    borderRadius:
                        AVATAR_SHAPES[props.user?.user?.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                            ? props.user?.user?.customization?.square_avatar
                                ? "5px"
                                : "100%"
                            : "100%",
                }}
                id={`dm-call-avatar-${props.user.user?.handle}`}
                className={`dm-call-user ${props.user.pickedUp ? "" : "calling"}`}
            ></div>
            {/* <video className="dm-video-feed" ref={ref as any}></video> */}
        </div>
    );
});

interface DmSelection extends UserPublic, BeezleDM.GroupChat {}

let selected: DmSelection = null;

enum HomePageType {
    Home,
    AddFriend,
    CreateGC,
}

interface BeezleCallSettings {
    video: boolean;
}

interface BeezleCallUser {
    user: UserPublic;
    beingCalled: boolean;
    pickedUp: boolean;
    video: boolean;
    muted: boolean;
}

async function GetDeviceConstraints() {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const cams = devices.filter((device) => device.kind == "videoinput");
    const mics = devices.filter((device) => device.kind == "audioinput");
    return { video: cams.length > 0, audio: mics.length > 0 };
}

function DmHomePageDisplay({
    page,
    setOptions,
    options,
}: {
    page: HomePageType;
    setOptions: React.Dispatch<React.SetStateAction<BeezleDM.DmOption[]>>;
    options: BeezleDM.DmOption[];
}) {
    switch (page) {
        case HomePageType.AddFriend:
            return <DmPageAddFriend setOptions={setOptions} options={options} />;
        case HomePageType.CreateGC:
            return <DmPageCreateGC setOptions={setOptions} options={options} />;
        default:
            <></>;
    }
}

function Loaded({ self_user, handle, setDisableIcon }: { self_user: UserPrivate; handle?: string; setDisableIcon: any }) {
    const [peer, setPeer] = useState<Peer>(null);
    const [userListOpen, setUserListOpen] = useState(true);
    const [dmSelections, setDmSelections] = useState<Array<BeezleDM.DmOption>>([]);
    const [mutualIndex, setMutualIndex] = useState(0);
    const [messages, setMessages] = useState<BeezleDM.Message[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>();
    const dmContentPanel = useRef<HTMLDivElement>();
    const usersContainer = useRef<HTMLDivElement>();
    const gcEditAddMemberInputRef = useRef<HTMLInputElement>();

    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [gifPickerOpen, setGifPickerOpen] = useState(false);
    const [_selected, setSelected] = useState<DmSelection>();
    const [gcEditing, setGcEditing] = useState<BeezleDM.GroupChat>();

    const [savedMessages, setSavedMessages] = useState<{ [handle: string]: BeezleDM.Message[] }>({});
    const [fetchedMessages, setFetchedMessages] = useState<{ [handle: string]: boolean }>({});

    // Typer
    const [typerReplier, setTyperReplyer] = useState<BeezleDM.Message>(null);

    const [callSettings, setCallSettings] = useState({
        muted: false,
        video: false,
    });
    const [usersInCall, setUsersInCall] = useState<Array<BeezleCallUser>>([]);
    const [BeingCalled, setBeingCalled] = useState(false);
    const [PickedUp, setPickedUp] = useState(false);

    const [calling, setCalling] = useState(false);
    const [peerCall, setPeerCall] = useState<MediaConnection>(null);
    const [ringtoneState, setRingtone] = useState<HTMLAudioElement>(null);
    const [streamFeed, setStreamFeed] = useState<MediaStream>();
    const [streamFeedDoc, setStreamFeedDoc] = useState<HTMLVideoElement>();
    const [streamInterval, setStreamInterval] = useState<NodeJS.Timeout>(null);
    const [window_width, setWindowWidth] = useState(window.innerWidth);
    const [typerEmbeds, setTyperEmbeds] = useState<Array<{ isVid: boolean; url: string; id: string }>>([]);
    const fileRef = useRef<HTMLInputElement>();

    // Add Friend
    const [homePageEnum, setHomePageEnum] = useState(HomePageType.Home);

    const UploadImage = async () => {
        toast.info("Uploading image/video...");
        const files = fileRef.current!.files as FileList;
        const file = files[0];
        const ext = files[0].type;
        const isVid = ext.match(/mp4|wmv/gi) ? true : false;
        const link = await UploadToImgurVideoByFile(file);

        if (!link || link.error) return toast.error("There was an error uploading the image/video!");

        setTimeout(() => setTyperEmbeds((old) => [...old, { isVid, url: link?.data?.link ?? "", id: Math.random().toString() }]), 150);
        toast.success("Successfully uploaded!");
        console.log(link);
    };

    const SaveMessage = (message: BeezleDM.Message, handle: string) => {
        setSavedMessages((old) => {
            const _new = { ...old };

            if (!_new[handle]) _new[handle] = [];
            _new[handle].push(message);

            return _new;
        });
    };

    const SaveMessages = (messages: BeezleDM.Message[], handle: string) => {
        setSavedMessages((old) => {
            const _new = { ...old };

            if (!_new[handle]) _new[handle] = [];
            _new[handle] = [..._new[handle], ...messages];

            return _new;
        });
    };

    const DeleteMessage = (msg_id: string) => {
        setSavedMessages((old) => {
            const _new = { ...old };

            for (const key of Object.keys(_new)) {
                const entry = _new[key];
                const index = entry.findIndex((x) => x.msg_id === msg_id);
                if (index > -1) {
                    _new[key].splice(index, 1);
                }
            }

            return _new;
        });

        setMessages((old) => {
            const _new = [...old];
            const index = _new.findIndex((x) => x.msg_id === msg_id);
            if (index > -1) {
                _new.splice(index, 1);
            }
            return _new;
        });
    };

    const EditMessage = (msg_id: string, content: string) => {
        setSavedMessages((old) => {
            const _new = { ...old };

            for (const key of Object.keys(_new)) {
                const entry = _new[key];
                const index = entry.findIndex((x) => x.msg_id === msg_id);
                if (index > -1) {
                    _new[key][index].content = content;
                    _new[key][index].edited = true;
                }
            }

            return _new;
        });

        setMessages((old) => {
            const _new = [...old];
            const index = _new.findIndex((x) => x.msg_id === msg_id);
            if (index > -1) {
                _new[index].content = content;
            }
            return _new;
        });
    };

    useEffect(() => {
        (async () => {
            if (handle) {
                selected = (await fetchUserPublic(handle)) as DmSelection;
                setSelected(selected);
            }

            const dmOptions = await axios.get(`${api_uri}/api/dms/get_selections`, GetFullAuth());
            setDmSelections(dmOptions.data as BeezleDM.DmOption[]);
        })();

        dmSocket.on("message-receive", async (message: BeezleDM.Message, is_group?: boolean) => {
            if (selected?.handle && !is_group) setMessages((old) => [...old, message]);
            if (is_group && selected?.group_id) setMessages((old) => [...old, message]);

            if (
                self_user.status_db != "dnd" &&
                ((is_group && message.channel !== selected?.group_id) || (!is_group && message.author !== selected?.handle))
            ) {
                const userOrGroup: DmSelection = (
                    is_group ? await fetchGroupChat(message.channel) : await fetchUserPublic(message.author)
                ) as DmSelection;
                toast(
                    <div className="dm-toast-icon">
                        <div
                            style={
                                is_group
                                    ? { backgroundImage: `url(${userOrGroup.avatar})`, borderRadius: "5px" }
                                    : {
                                          backgroundImage: `url(${userOrGroup.avatar})`,
                                          clipPath: AVATAR_SHAPES[userOrGroup.customization?.square_avatar]
                                              ? AVATAR_SHAPES[userOrGroup.customization?.square_avatar].style
                                              : "",
                                          borderRadius:
                                              AVATAR_SHAPES[userOrGroup.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                                                  ? userOrGroup.customization?.square_avatar
                                                      ? "5px"
                                                      : "100%"
                                                  : "100%",
                                      }
                            }
                            className="dm-toast-avatar"
                        ></div>{" "}
                        <b>{!is_group ? `@${message.author}` : userOrGroup.name}</b>: {sanitize(message.content)}
                    </div>,
                    {
                        progressClassName: "var-color",
                        onClick: async (ev) => {
                            selected = userOrGroup as DmSelection;
                            setSelected(userOrGroup as DmSelection);
                        },
                    },
                );
                const audio = new Audio(chatNotif);
                audio.play();
                setTimeout(() => {
                    audio.remove();
                }, 1100);
            }

            SaveMessage(message, is_group ? message.channel : message.author);
        });

        dmSocket.on("message-deleted", (msg_id: string) => DeleteMessage(msg_id));
        dmSocket.on("message-edited", (msg_id: string, content: string) => {
            console.log("MESSAGE EDITED", msg_id, content);
            EditMessage(msg_id, content);
        });

        const _peer = new Peer(self_user.handle, {
            host: server_uri,
            path: "/calling",
            secure: true,
            port: 443,
        });
        setPeer(_peer);
        console.log("PEER", _peer);
        HandleCallReceives(_peer);

        if (window.innerWidth <= 1100 && userListOpen) {
            setDisableIcon(true);
        }
        const onResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth <= 1100 && userListOpen) {
                setDisableIcon(true);
            }

            if (window.innerWidth > 1100) {
                setDisableIcon(false);
            }
        };

        window.addEventListener("resize", onResize);

        return () => {
            _peer.disconnect();
            window.removeEventListener("resize", onResize);
        };
    }, []);

    const DeleteAllInstances = (handle: string) => {
        document.getElementById(`dm-video-feed-${handle}`)?.remove();
    };

    const ChangeUserInCall = (handle: string, settings: { muted: boolean; video: boolean }) => {
        setUsersInCall((old) => {
            const _new = [...old];
            const index = _new.findIndex((x) => x.user.handle === handle);
            if (index > -1) {
                _new[index].video = settings.video;
                _new[index].muted = settings.muted;
            }
            return _new;
        });

        const feed = document.getElementById(`dm-video-feed-${handle}`);
        console.log(`dm-video-feed-${handle}`, feed, settings);
        if (feed) {
            feed.style.display = settings.video ? "inline-block" : "none";
            const avatar = document.getElementById(`dm-call-avatar-${handle}`);
            avatar.style.display = !settings.video ? "inline-block" : "none";
        }
    };

    const HandleCallReceives = async (peer: Peer) => {
        // We're being called
        peer.on("call", async (call) => {
            const ringtoneAudio = new Audio(ringtone);
            document.body.appendChild(ringtoneAudio);
            ringtoneAudio.loop = true;
            ringtoneAudio.play();
            setRingtone(ringtoneAudio);
            console.log("Incoming CALL!", call);
            setCalling(true);
            setPickedUp(false);
            setBeingCalled(true);
            setPeerCall(call);

            const caller = await fetchUserPublic(call.peer);
            if (caller) {
                toast(
                    <div className="dm-toast-icon">
                        <div
                            style={{
                                backgroundImage: `url(${caller.avatar})`,
                                clipPath: AVATAR_SHAPES[caller.customization?.square_avatar]
                                    ? AVATAR_SHAPES[caller.customization?.square_avatar].style
                                    : "",
                                borderRadius:
                                    AVATAR_SHAPES[caller.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                                        ? caller.customization?.square_avatar
                                            ? "5px"
                                            : "100%"
                                        : "100%",
                            }}
                            className="dm-toast-avatar"
                        ></div>{" "}
                        <b>@{caller.handle}</b> is calling you!
                    </div>,
                    {
                        progressClassName: "var-color",
                        onClick: async (ev) => {
                            selected = caller as DmSelection;
                            setSelected(caller as DmSelection);
                        },
                    },
                );
            }

            setUsersInCall((old) => [
                {
                    user: caller,
                    pickedUp: true,
                    beingCalled: false,
                    video: false,
                    muted: false,
                },
                {
                    user: self_user,
                    beingCalled: true,
                    pickedUp: false,
                    video: false,
                    muted: false,
                },
            ]);

            DeleteAllInstances("dm-video-feed-" + call.peer);
            let videoFeed = document.createElement("video");
            videoFeed.className = "dm-video-feed";
            videoFeed.style.display = "none";
            videoFeed.id = "dm-video-feed-" + call.peer;

            call.on("stream", async (userStream) => OnStreamIncoming(userStream, call, videoFeed, null, ringtoneAudio, self_user.handle));

            call.on("close", () => {
                videoFeed.remove();
                setCalling(false);
                setBeingCalled(false);
                setPickedUp(false);
                setPeerCall(null);
                setCallSettings({ muted: false, video: false });
                setUsersInCall([]);
                ringtoneAudio.pause();
                ringtoneAudio.remove();
            });
        });

        dmSocket.on("call-change-settings", (settings: { muted: boolean; video: boolean }, from: string) => {
            ChangeUserInCall(from, settings);
        });
    };

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target! as HTMLDivElement;
        if (!(element.scrollHeight - element.scrollTop === element.clientHeight)) return;

        // detected bottom
        console.log("at bottom!");
        if (self_user?.is_bot) return console.error("Bot Accounts are not allowed to use the site.");
        // await MutualRefresher(mutualIndex);
    };

    useEffect(() => {
        if (!(_selected?.group_id ?? _selected?.handle)) {
            setMessages([]);
            return;
        }

        if (!fetchedMessages[_selected.group_id ?? _selected.handle]) {
            axios
                .post(
                    `${api_uri}/api/dms/get_messages`,
                    {
                        offset: 0,
                        handle: _selected.group_id ?? _selected.handle,
                        is_group: _selected.group_id ? true : false,
                    },
                    GetFullAuth(),
                )
                .then((res) => {
                    const data = res.data;
                    console.log(data);
                    SaveMessages(data.messages, _selected.group_id ?? _selected.handle);
                    console.log("FETCHED", "data");
                    setMessages(data.messages);

                    setFetchedMessages((old) => {
                        const _new = { ...old };
                        _new[_selected.group_id ?? _selected.handle] = true;
                        return _new;
                    });
                });
        } else {
            console.log(savedMessages[_selected?.group_id ?? _selected?.handle]);
            setMessages(savedMessages[_selected?.group_id ?? _selected?.handle] ?? []);
        }
    }, [_selected]);

    const SendMessage = () => {
        const content = textareaRef.current!.value;
        console.log("TYPER REPLIER", typerReplier);
        let links = " ";
        typerEmbeds.forEach((embed) => (links += embed.url + " "));
        links.trimEnd();
        const msg: BeezleDM.Message = {
            author: self_user.handle,
            content: content + links,
            msg_id: Math.random().toString(),
            timestamp: moment().utc().unix(),
            replying_to: typerReplier ? typerReplier.msg_id : undefined,
        };
        // setMessages((old) => [...old, msg]);
        // SaveMessage(msg, selected.handle);

        dmContentPanel.current!.scrollTop = dmContentPanel.current!.scrollHeight;
        textareaRef.current!.value = "";
        dmSocket.emit("message", msg, self_user, selected?.group_id ?? selected.handle, selected?.group_id ? true : false);
        setTyperEmbeds([]);

        if (typerReplier) setTyperReplyer(null);
    };

    useEffect(() => {
        if (!dmContentPanel.current) return;
        dmContentPanel.current!.scrollTop = dmContentPanel.current!.scrollHeight;
    }, [messages]);

    const OnStreamIncoming = (
        userStream: MediaStream,
        call: MediaConnection,
        videoFeed: HTMLVideoElement,
        selfFeed: HTMLVideoElement | null,
        ringtoneAudio: HTMLAudioElement,
        handle: string,
        PickedUp: boolean = true,
    ) => {
        setTimeout(() => {
            dmSocket.emit("call-change-settings", callSettings, call.peer);
        }, 100);
        setPickedUp(PickedUp);
        let callUserDoc = document.getElementById(`dm-call-${call.peer}`);
        callUserDoc.appendChild(videoFeed);

        if (selfFeed) {
            let selfUserDoc = document.getElementById(`dm-call-${self_user.handle}`);

            selfUserDoc.appendChild(selfFeed);
            selfFeed.addEventListener("loadedmetadata", () => {
                selfFeed.play();
            });
        }

        setUsersInCall((old) => {
            const _new = [...old];
            _new[_new.findIndex((x) => x.user.handle === handle)].pickedUp = true;
            _new[_new.findIndex((x) => x.user.handle === handle)].beingCalled = false;
            return _new;
        });

        // Create a video element & feed the user stream, this way we can get their audio.
        videoFeed.srcObject = userStream;
        videoFeed.addEventListener("loadedmetadata", () => {
            videoFeed.play();
        });

        ringtoneAudio.pause();
        ringtoneAudio.remove();
    };

    const Call = async (settings: BeezleCallSettings) => {
        if (!selected) {
            toast.error("You can't call nothing, moron.");
            return;
        }

        const constraints = await GetDeviceConstraints();

        if (!constraints.video && settings.video) {
            toast.error("Couldn't detect any camera devices, calling without video.");
        }

        if (!constraints.audio) {
            toast.error("Couldn't detect a microphone, calling without audio.");
        }

        navigator.mediaDevices
            .getUserMedia({
                video: constraints.video,
                audio: constraints.audio,
            })
            .then((stream) => {
                stream.getVideoTracks()?.forEach((track) => (track.enabled = false));
                const ringtoneAudio = new Audio(ringtone);
                document.body.appendChild(ringtoneAudio);
                ringtoneAudio.loop = true;
                ringtoneAudio.play();
                setRingtone(ringtoneAudio);
                setStreamFeed(stream);

                setCalling(true);
                setBeingCalled(false);
                setPickedUp(true);
                stream.getTracks()[0].getSettings().noiseSuppression = true;
                stream.getAudioTracks()[0].getSettings().noiseSuppression = true;
                // Call the selected person
                const call = peer.call(selected.handle, stream);
                setPeerCall(call);

                // Add us first, we have picked up as we're the one calling & we're not being called
                // Add the user we're calling, they have not picked up & they're being called
                setUsersInCall((old) => [
                    {
                        user: self_user,
                        beingCalled: false,
                        pickedUp: true,
                        video: false,
                        muted: false,
                    },
                    {
                        user: selected,
                        pickedUp: false,
                        beingCalled: true,
                        video: false,
                        muted: false,
                    },
                ]);

                // If they pick up
                DeleteAllInstances("dm-video-feed-" + call.peer);
                let videoFeed = document.createElement("video");
                videoFeed.className = "dm-video-feed";
                videoFeed.style.display = "none";
                videoFeed.id = "dm-video-feed-" + call.peer;

                DeleteAllInstances("dm-video-feed-" + self_user.handle);
                let selfFeed = document.createElement("video");
                selfFeed.className = "dm-video-feed";
                selfFeed.style.display = "none";
                selfFeed.srcObject = stream;
                selfFeed.muted = true;
                selfFeed.id = "dm-video-feed-" + self_user.handle;

                selfFeed.addEventListener("loadedmetadata", () => {
                    selfFeed.play();
                });

                call.on("stream", async (userStream) => {
                    let selfUserDoc = document.getElementById(`dm-call-${self_user.handle}`);
                    selfUserDoc.appendChild(selfFeed);
                    OnStreamIncoming(userStream, call, videoFeed, null, ringtoneAudio, call.peer);
                });

                // If they don't pick up or they hang up
                const __Close = async () => {
                    console.log("They closed the call :(");
                    call.close();
                    setCalling(false);
                    setBeingCalled(false);
                    setPickedUp(false);
                    setStreamFeed(null);
                    setPeerCall(null);
                    setUsersInCall([]);
                    ringtoneAudio.pause();
                    ringtoneAudio.remove();

                    videoFeed.remove();
                    selfFeed.remove();
                };
                call.on("close", __Close);
                call.on("error", __Close);

                call.on("willCloseOnRemote", async () => {
                    console.log("REMOTE CLOSE");
                });
            });
    };

    const AnswerCall = async () => {
        const constraints = await GetDeviceConstraints();
        navigator.mediaDevices
            .getUserMedia({
                video: constraints.video,
                audio: constraints.audio,
            })
            .then((stream) => {
                stream.getVideoTracks()?.forEach((track) => (track.enabled = false));
                DeleteAllInstances("dm-video-feed-" + self_user.handle);
                let selfUserDoc = document.getElementById(`dm-call-${self_user.handle}`);
                let selfFeed = document.createElement("video");
                selfFeed.className = "dm-video-feed";
                selfFeed.style.display = "none";
                selfFeed.srcObject = stream;
                selfFeed.muted = true;
                selfFeed.id = "dm-video-feed-" + self_user.handle;
                selfUserDoc.appendChild(selfFeed);
                selfFeed.addEventListener("loadedmetadata", () => {
                    selfFeed.play();
                });

                setStreamFeed(stream);
                setStreamFeedDoc(selfFeed);

                peerCall.answer(stream);
            });
    };

    const DeclineCall = async () => {
        if (peerCall) {
            peerCall.close();
            setStreamFeed(null);
            if (streamFeedDoc) streamFeedDoc.remove();
            setStreamFeedDoc(null);
            console.log("CALL CLOSED");
        }
        setCalling(false);
        setBeingCalled(false);
        setPickedUp(false);
        setPeerCall(null);
        setCallSettings({ muted: false, video: false });
        if (ringtoneState) {
            ringtoneState.pause();
            ringtoneState.remove();
        }
    };

    // Call Settings
    useEffect(() => {
        if (!streamFeed) return;
        streamFeed.getVideoTracks()?.forEach((track) => (track.enabled = callSettings.video));
        streamFeed.getAudioTracks()?.forEach((track) => (track.enabled = !callSettings.muted));

        if (peerCall) {
            dmSocket.emit("call-change-settings", callSettings, peerCall.peer);
            ChangeUserInCall(self_user.handle, callSettings);
        }
    }, [callSettings]);

    return (
        <>
            {gcEditing ? (
                <div className="dm-popup">
                    <div className="dm-gc-members-list">
                        <h1>
                            <i className="fa-solid fa-gears"></i> {gcEditing?.name} Settings
                        </h1>
                        <a onClick={() => setGcEditing(null)} className="close-popup-btn">
                            <i className="fa-solid fa-x" />
                        </a>
                        {gcEditing.owner === self_user.handle ? (
                            <>
                                <Divider />
                                <DmEditGC gc={gcEditing} options={dmSelections} setOptions={setDmSelections} />
                                <Divider />
                                <h2>
                                    <i className="fa-solid fa-users-gear"></i> Manage Members
                                </h2>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        toast.info("Adding member...");
                                        const value = gcEditAddMemberInputRef.current!.value as string;
                                        const res = await axios.patch(
                                            `${api_uri}/api/dms/gc_add_member`,
                                            {
                                                handle: value,
                                                group_id: gcEditing.group_id,
                                            },
                                            GetFullAuth(),
                                        );
                                        if (res.data.error) toast.error(res.data.error);
                                        else toast.success(res.data.message + ", Please refresh.");
                                    }}
                                >
                                    <label>Add New Member</label>
                                    <input
                                        ref={gcEditAddMemberInputRef}
                                        style={{ width: "100%" }}
                                        className="input-field"
                                        placeholder="User's Handle"
                                    />
                                    <button className="button-field">
                                        <i className="fa-solid fa-user-plus"></i> Add Friend
                                    </button>
                                </form>
                            </>
                        ) : null}
                        <Divider />
                        <div className="user-list">
                            {gcEditing.members.map((member) => (
                                <DmEditGCMember self_user={self_user} gc={gcEditing} handle={member} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}

            <div className="dm-screen">
                <div style={{ display: userListOpen ? "inline-block" : "none" }} className="dms-user-list">
                    <div onScroll={handleScroll} className="dm-user-list">
                        <div className="dm-user-list-pad">
                            <a
                                onClick={() => {
                                    setUserListOpen((old) => {
                                        const _new = !old;

                                        setDisableIcon(false);
                                        return _new;
                                    });
                                }}
                                className="open-close-dms"
                            >
                                <i className="fa-solid fa-left-to-line"></i>
                            </a>

                            <div>
                                <a
                                    onClick={() => {
                                        setSelected(null);
                                        selected = null;
                                    }}
                                    className="dm-btn"
                                >
                                    <i className="fa-solid fa-house" /> Home
                                </a>
                                <Divider />
                                <h4 className="dm-header">
                                    <i className="fa-solid fa-messages"></i> Direct Messages
                                </h4>
                            </div>
                            <div>
                                {dmSelections.map((option) => {
                                    return (
                                        <DmUserBox
                                            selected={
                                                option.is_group ? option.group_id === selected?.group_id : option.user_handle === _selected?.handle
                                            }
                                            dm_option={option}
                                            self_user={self_user}
                                            key={option.user_handle ?? option.group_id}
                                            setSelection={setDmSelections}
                                            onClick={async () => {
                                                if (!option.is_group) {
                                                    selected = (await fetchUserPublic(option.user_handle)) as DmSelection;
                                                    setSelected(selected);
                                                } else {
                                                    selected = (await fetchGroupChat(option.group_id)) as DmSelection;
                                                    setSelected(selected);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            {dmSelections.length < 1 ? "No Options Found :(" : ""}
                        </div>
                    </div>
                    <div className="dm-user-list-pad-bottom">
                        <div
                            style={{
                                backgroundImage: `url(${self_user.avatar})`,
                                clipPath: AVATAR_SHAPES[self_user.customization?.square_avatar]
                                    ? AVATAR_SHAPES[self_user.customization?.square_avatar].style
                                    : "",
                                borderRadius:
                                    AVATAR_SHAPES[self_user.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                                        ? self_user.customization?.square_avatar
                                            ? "5px"
                                            : "100%"
                                        : "100%",
                            }}
                            className="avatar"
                        ></div>
                        <p
                            style={{
                                fontFamily: self_user?.customization?.display_name?.font?.bought
                                    ? self_user?.customization?.display_name?.font?.font_family
                                    : "gordin",
                            }}
                            className="username"
                        >
                            <Username user={self_user} />
                        </p>
                        <p className="handle">@{self_user.handle}</p>
                    </div>
                </div>
            </div>

            <div className="dm-data-side">
                <div style={{ display: !calling ? "none" : "flex" }} className="dm-call-panel">
                    <div className="dm-call-panel-users">
                        {usersInCall.map((user) => {
                            return <CallUser user={user} />;
                        })}
                    </div>
                    <div className="dm-call-bottom-panel">
                        {PickedUp ? (
                            <>
                                <button
                                    onClick={() =>
                                        setCallSettings((old) => {
                                            const _new = { ...old };
                                            _new.video = !_new.video;
                                            return _new;
                                        })
                                    }
                                    className={"dm-call-button " + (callSettings.video ? "bg-var" : "bg-red")}
                                >
                                    <i className={"fa-solid fa-video" + (callSettings.video ? "" : "-slash")}></i>
                                </button>
                                <button
                                    onClick={() =>
                                        setCallSettings((old) => {
                                            const _new = { ...old };
                                            _new.muted = !_new.muted;
                                            return _new;
                                        })
                                    }
                                    className={"dm-call-button " + (callSettings.muted ? "bg-red" : "bg-var")}
                                >
                                    <i className={"fa-solid fa-microphone" + (callSettings.muted ? "-slash" : "")}></i>
                                </button>
                                <button onClick={DeclineCall} className={`dm-call-button bg-red`}>
                                    <i className={`fa-solid fa-phone-hangup`}></i>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={AnswerCall} className={`dm-call-button bg-green`}>
                                    <i className={`fa-solid fa-phone`}></i>
                                </button>
                                <button onClick={DeclineCall} className={`dm-call-button bg-red`}>
                                    <i className={`fa-solid fa-phone-hangup`}></i>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {_selected ? (
                    <>
                        <div className="dm-info-panel">
                            <div
                                style={{
                                    backgroundImage: `url(${selected?.avatar})`,
                                    clipPath: AVATAR_SHAPES[selected?.customization?.square_avatar]
                                        ? AVATAR_SHAPES[selected?.customization?.square_avatar].style
                                        : "",
                                    borderRadius:
                                        AVATAR_SHAPES[selected?.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                                            ? selected?.customization?.square_avatar
                                                ? "5px"
                                                : "100%"
                                            : "100%",
                                }}
                                className="avatar"
                            ></div>
                            <p className="handle">
                                {selected?.group_id ? null : "@"}
                                {selected?.name ?? selected?.handle} -{" "}
                            </p>
                            <div className="info-buttons">
                                {selected?.group_id ? (
                                    <>
                                        <a
                                            onClick={() => {
                                                setGcEditing(selected);
                                            }}
                                            className="info-button"
                                        >
                                            <i className="fa-solid fa-users-gear"></i>
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <a onClick={() => Call({ video: false })} className="info-button">
                                            <i className="fa-solid fa-phone-volume"></i>
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                        <div ref={dmContentPanel} className="dm-data">
                            {messages.map((msg) => {
                                return (
                                    <Message
                                        key={msg.msg_id}
                                        msg={msg}
                                        setTyperReplyer={setTyperReplyer}
                                        self_user={self_user}
                                        EditMessage={EditMessage}
                                        DeleteMessage={DeleteMessage}
                                    />
                                );
                            })}
                        </div>
                        <div className="dm-bottom-panel">
                            <div className="dm-bottom-panel-input">
                                <div className="dm-textfield">
                                    <div className="dm-textfield-padding">
                                        {emojiPickerOpen ? (
                                            <EmojiPicker
                                                onEmojiClick={(emojiData: EmojiClickData, event: MouseEvent) => {
                                                    textareaRef.current!.value += emojiData.isCustom ? `<:${emojiData.emoji}:> ` : emojiData.emoji;
                                                }}
                                                theme={Theme.DARK}
                                                emojiStyle={EmojiStyle.NATIVE}
                                                customEmojis={self_user?.customization?.emojis ?? []}
                                                className="dm-picker"
                                            />
                                        ) : (
                                            ""
                                        )}

                                        {gifPickerOpen ? (
                                            <div className="dm-picker-gif">
                                                <GifPicker
                                                    onGifClick={(gif: TenorImage) => {
                                                        textareaRef.current!.value += ` ${gif.url}`;
                                                    }}
                                                    tenorApiKey={tenor_api_key}
                                                    theme={Theme.DARK}
                                                />
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                        {typerReplier ? (
                                            <div className="dm-typer-replyer">
                                                <p>
                                                    <i className="fa-solid fa-reply" /> Replying to @{typerReplier.author}
                                                </p>
                                                <div className="dm-typer-replyer-buttons">
                                                    <a onClick={() => setTyperReplyer(null)}>
                                                        <i className="fa-solid fa-x"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        ) : null}
                                        {typerEmbeds.length > 0 ? (
                                            <div className="dm-imagevideo-holder">
                                                {typerEmbeds.map((embed, index) => (
                                                    <TyperEmbed
                                                        key={embed.id}
                                                        onXClick={() => {
                                                            setTyperEmbeds((old) => {
                                                                const _new = [...old];
                                                                _new.splice(index, 1);
                                                                return _new;
                                                            });
                                                        }}
                                                        isVid={embed.isVid}
                                                        url={embed.url}
                                                    />
                                                ))}
                                            </div>
                                        ) : null}
                                        <textarea
                                            ref={textareaRef}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    SendMessage();
                                                }
                                            }}
                                            style={{ resize: "none" }}
                                            className="dm-textarea"
                                            placeholder={`Message ${_selected.group_id ? _selected.name : _selected.username}`}
                                        />
                                        <div className="dm-textarea-buttons">
                                            <input
                                                onChange={UploadImage}
                                                accept=".jpeg,.gif,.png,.jpg,.mp4"
                                                ref={fileRef}
                                                type="file"
                                                style={{ display: "none" }}
                                            />{" "}
                                            <a onClick={() => fileRef.current!.click()} className="dm-panel-button">
                                                <i className="fa-solid fa-image"></i>
                                            </a>
                                            <a onClick={() => setEmojiPickerOpen((old) => !old)} className="dm-panel-button">
                                                <i className="fa-solid fa-face-awesome"></i>
                                            </a>
                                            <a onClick={() => setGifPickerOpen((old) => !old)} className="dm-panel-button">
                                                <i className="fa-solid fa-gif"></i>
                                            </a>
                                            <a onClick={SendMessage} className="dm-panel-button dm-send-button">
                                                <i className="fa-solid fa-paper-plane-top"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="dm-data-side-not-selected">
                        <h1>
                            Welcome to Beezle{" "}
                            <span
                                style={{
                                    fontSize: "35px",
                                    marginLeft: "-5px",
                                    marginRight: "5px",
                                }}
                                className="re-text"
                            >
                                :RE
                            </span>
                            DMs!
                        </h1>
                        <p style={{ margin: "0" }}>Start buzzing with your friends by adding channels on the left panel & selecting them.</p>
                        <div className="dm-home-button-container">
                            <button onClick={() => setHomePageEnum(HomePageType.AddFriend)} className="button-field">
                                <i className="fa-solid fa-user-plus"></i> Add Friend
                            </button>
                            <button onClick={() => setHomePageEnum(HomePageType.CreateGC)} className="button-field">
                                <i className="fa-solid fa-users"></i> Create a Group Chat
                            </button>
                        </div>

                        <DmHomePageDisplay page={homePageEnum} setOptions={setDmSelections} options={dmSelections} />
                    </div>
                )}
            </div>

            {!userListOpen ? (
                <a
                    onClick={() =>
                        setUserListOpen((old) => {
                            const _new = !old;

                            if (window_width <= 1100) {
                                setDisableIcon(true);
                            }
                            return _new;
                        })
                    }
                    className="open-close-dms2"
                >
                    <i className="fa-solid fa-right-to-line"></i>
                </a>
            ) : (
                ""
            )}
        </>
    );
}

function MiddleSide({ handle, setDisableIcon }: { handle: string; setDisableIcon: any }) {
    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);

    useEffect(() => {
        (async () => {
            if (localStorage.getItem("access_token")) {
                setSelfUser(await fetchUserPrivate());
            }
        })();
    }, []);

    return <>{self_user ? <Loaded handle={handle} setDisableIcon={setDisableIcon} self_user={self_user} /> : <h1>Loading...</h1>}</>;
}

export default MiddleSide;
