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

function Message({ msg, self_user }: { msg: BeezleDM.Message; self_user: UserPrivate }) {
    const [user, setUser] = useState<UserPublic>();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            setUser(await fetchUserPublic(msg.author));
        })();
    }, []);

    return (
        <div className="dm-message">
            <div className="dm-msg-author">
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
                    {user?.username} -{" "}
                    <span className="dm-timestamp">
                        {moment(msg.timestamp)
                            .fromNow(true)
                            .replace("minutes", "m")
                            .replace(" ", "")
                            .replace("hours", "h")
                            .replace("afew seconds", "1s")
                            .replace("aminute", "1m")
                            .replace("ahour", "1h")
                            .replace("anhour", "1h")
                            .replace("aday", "1d")
                            .replace("days", "d")
                            .replace("day", "1d")
                            .replace("months", " months")
                            .replace("amonth", "1 month")
                            .replace("ayear", "1 year")
                            .replace("years", "y")}
                    </span>
                </p>
                <p className="handle">@{user?.handle}</p>
            </div>
            <p
                dangerouslySetInnerHTML={{
                    __html: parseURLs(msg.content, user, true, Math.random().toString(), navigate),
                }}
                className="dm-content"
            ></p>
        </div>
    );
}

interface CallUserProps {
    user: UserPublic;
    pickedUp: boolean;
    beingCalled: boolean;
}
const CallUser = forwardRef<HTMLVideoElement, CallUserProps>((props: CallUserProps, ref) => {
    return (
        <>
            <div
                style={{
                    backgroundImage: `url(${props.user?.avatar})`,
                    clipPath: AVATAR_SHAPES[props.user?.customization?.square_avatar]
                        ? AVATAR_SHAPES[props.user?.customization?.square_avatar].style
                        : "",
                    borderRadius:
                        AVATAR_SHAPES[props.user?.customization?.square_avatar]?.name !== "Circle Avatar Shape"
                            ? props.user?.customization?.square_avatar
                                ? "5px"
                                : "100%"
                            : "100%",
                }}
                className={`dm-call-user ${props.pickedUp ? "" : "calling"}`}
            ></div>
            <video className="dm-video-feed" ref={ref as any}></video>
        </>
    );
});

let selected: UserPublic = null;

enum HomePageType {
    Home,
    AddFriend,
    CreateGC,
}

function DmHomePageDisplay({ page, setOptions }: { page: HomePageType; setOptions: React.Dispatch<React.SetStateAction<BeezleDM.DmOption[]>> }) {
    switch (page) {
        case HomePageType.AddFriend:
            return <DmPageAddFriend setOptions={setOptions} />;
        case HomePageType.CreateGC:
            return <DmPageCreateGC setOptions={setOptions} />;
        default:
            <></>;
    }
}

function Loaded({ self_user, handle }: { self_user: UserPrivate; handle?: string }) {
    const [peer, setPeer] = useState<Peer>(null);
    const [userListOpen, setUserListOpen] = useState(true);
    const [dmSelections, setDmSelections] = useState<Array<BeezleDM.DmOption>>([]);
    const [mutualIndex, setMutualIndex] = useState(0);
    const [messages, setMessages] = useState<BeezleDM.Message[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>();
    const dmContentPanel = useRef<HTMLDivElement>();
    const usersContainer = useRef<HTMLDivElement>();

    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [gifPickerOpen, setGifPickerOpen] = useState(false);
    const [_selected, setSelected] = useState<UserPublic>();

    const [savedMessages, setSavedMessages] = useState<{ [handle: string]: BeezleDM.Message[] }>({});
    const [fetchedMessages, setFetchedMessages] = useState<{ [handle: string]: boolean }>({});

    const [callSettings, setCallSettings] = useState({
        muted: false,
        video: false,
    });
    const [usersInCall, setUsersInCall] = useState<Array<{ user: UserPublic; beingCalled: boolean; pickedUp: boolean }>>([]);
    const [BeingCalled, setBeingCalled] = useState(false);
    const [PickedUp, setPickedUp] = useState(false);

    const [calling, setCalling] = useState(false);
    const [peerCall, setPeerCall] = useState<MediaConnection>(null);
    const [ringtoneState, setRingtone] = useState<HTMLAudioElement>(null);

    // Add Friend
    const [homePageEnum, setHomePageEnum] = useState(HomePageType.Home);

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

    useEffect(() => {
        (async () => {
            if (handle) {
                selected = await fetchUserPublic(handle);
                setSelected(selected);
            }

            const dmOptions = await axios.get(`${api_uri}/api/dms/get_selections`, GetFullAuth());
            setDmSelections(dmOptions.data as BeezleDM.DmOption[]);
        })();

        dmSocket.on("connect", () => {
            console.log("Connected to server!");
            dmSocket.emit("beezle-connect", localStorage.getItem("access_token"));
        });

        dmSocket.on("message-receive", (message: BeezleDM.Message) => {
            if (selected?.handle === message.author) setMessages((old) => [...old, message]);

            SaveMessage(message, message.author);
        });

        const _peer = new Peer(self_user.handle, {
            host: server_uri,
            path: "/calling",
            secure: true,
            port: 3001,
        });
        setPeer(_peer);
        HandleCallReceives(_peer);

        return () => {
            _peer.disconnect();
        };
    }, []);

    const HandleCallReceives = async (peer: Peer) => {
        // We're being called
        peer.on("call", async (call) => {
            const ringtoneAudio = new Audio(ringtone);
            ringtoneAudio.loop = true;
            ringtoneAudio.play();
            setRingtone(ringtoneAudio);
            console.log("Incoming CALL!", call);
            setCalling(true);
            setPickedUp(false);
            setBeingCalled(true);
            setPeerCall(call);

            const caller = await fetchUserPublic(call.peer);

            setUsersInCall((old) => [
                {
                    user: caller,
                    pickedUp: true,
                    beingCalled: false,
                },
                {
                    user: self_user,
                    beingCalled: true,
                    pickedUp: false,
                },
            ]);

            let videoFeed = document.createElement("video");
            call.on("stream", async (userStream) => {
                videoFeed.srcObject = userStream;
                videoFeed.addEventListener("loadedmetadata", () => {
                    videoFeed.play();
                });

                setUsersInCall((old) => {
                    const _new = [...old];
                    _new[_new.findIndex((x) => x.user.handle === self_user.handle)].pickedUp = true;
                    _new[_new.findIndex((x) => x.user.handle === self_user.handle)].beingCalled = false;
                    return _new;
                });

                setPickedUp(true);
                setBeingCalled(false);
                ringtoneAudio.pause();
                ringtoneAudio.remove();
            });

            call.on("close", () => {
                videoFeed.remove();
                setCalling(false);
                setBeingCalled(false);
                setPickedUp(false);
                setPeerCall(null);
                ringtoneAudio.pause();
                ringtoneAudio.remove();
            });
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
        if (!_selected) {
            setMessages([]);
            return;
        }

        if (!fetchedMessages[_selected?.handle]) {
            axios
                .post(
                    `${api_uri}/api/dms/get_messages`,
                    {
                        offset: 0,
                        handle: _selected.handle,
                    },
                    GetFullAuth(),
                )
                .then((res) => {
                    const data = res.data;
                    console.log(data);
                    SaveMessages(data.messages, _selected.handle);
                    console.log("FETCHED", "data");
                    setMessages(data.messages);

                    setFetchedMessages((old) => {
                        const _new = { ...old };
                        _new[_selected.handle] = true;
                        return _new;
                    });
                });
        } else {
            console.log(savedMessages[_selected?.handle]);
            setMessages(savedMessages[_selected?.handle] ?? []);
        }
    }, [_selected]);

    const SendMessage = () => {
        const content = textareaRef.current!.value;
        const msg: BeezleDM.Message = {
            author: self_user.handle,
            content,
            msg_id: Math.random().toString(),
            timestamp: new Date(),
        };
        setMessages((old) => [...old, msg]);
        SaveMessage(msg, selected.handle);

        dmContentPanel.current!.scrollTop = dmContentPanel.current!.scrollHeight;
        textareaRef.current!.value = "";

        dmSocket.emit("message", msg, self_user, selected.handle);
    };

    useEffect(() => {
        if (!dmContentPanel.current) return;
        dmContentPanel.current!.scrollTop = dmContentPanel.current!.scrollHeight;
    }, [messages]);

    const Call = async () => {
        if (!selected) {
            toast.error("You can't call nothing, moron.");
            return;
        }

        navigator.mediaDevices
            .getUserMedia({
                video: false,
                audio: true,
            })
            .then((stream) => {
                const ringtoneAudio = new Audio(ringtone);
                ringtoneAudio.loop = true;
                ringtoneAudio.play();
                setRingtone(ringtoneAudio);

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
                    },
                    {
                        user: selected,
                        pickedUp: false,
                        beingCalled: true,
                    },
                ]);

                // If they pick up
                let videoFeed = document.createElement("video");
                call.on("stream", async (userStream) => {
                    setUsersInCall((old) => {
                        const _new = [...old];
                        _new[_new.findIndex((x) => x.user.handle === selected.handle)].pickedUp = true;
                        _new[_new.findIndex((x) => x.user.handle === selected.handle)].beingCalled = false;
                        return _new;
                    });

                    // Create a video element & feed the user stream, this way we can get their audio.
                    videoFeed.srcObject = userStream;
                    videoFeed.addEventListener("loadedmetadata", () => {
                        videoFeed.play();
                    });

                    ringtoneAudio.pause();
                    ringtoneAudio.remove();
                });

                // If they don't pick up or they hang up
                call.on("close", async () => {
                    call.close();
                    setCalling(false);
                    setBeingCalled(false);
                    setPickedUp(false);
                    setPeerCall(null);
                    setUsersInCall([]);
                    ringtoneAudio.pause();
                    ringtoneAudio.remove();

                    videoFeed.remove();
                });
            });
    };

    const AnswerCall = async () => {
        navigator.mediaDevices
            .getUserMedia({
                video: false,
                audio: true,
            })
            .then((stream) => {
                peerCall.answer(stream);
            });
    };

    const DeclineCall = async () => {
        if (peerCall) peerCall.close();
        setCalling(false);
        setBeingCalled(false);
        setPickedUp(false);
        setPeerCall(null);
        if (ringtoneState) {
            ringtoneState.pause();
            ringtoneState.remove();
        }
    };

    return (
        <>
            <div className="dm-screen">
                <div style={{ display: userListOpen ? "inline-block" : "none" }} className="dms-user-list">
                    <div onScroll={handleScroll} className="dm-user-list">
                        <div className="dm-user-list-pad">
                            <a onClick={() => setUserListOpen((old) => !old)} className="open-close-dms">
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
                            {dmSelections.map((option) => {
                                return (
                                    <DmUserBox
                                        dm_option={option}
                                        self_user={self_user}
                                        setSelection={setDmSelections}
                                        onClick={async () => {
                                            if (!option.is_group) {
                                                selected = await fetchUserPublic(option.user_handle);
                                                setSelected(selected);
                                            }
                                        }}
                                    />
                                );
                            })}
                            {dmSelections.length < 1 ? "No Options Found :(" : ""}
                        </div>
                    </div>
                </div>
            </div>

            <div className="dm-data-side">
                <div style={{ display: !calling ? "none" : "flex" }} className="dm-call-panel">
                    <div className="dm-call-panel-users">
                        {usersInCall.map((user) => {
                            return <CallUser user={user.user} beingCalled={user.beingCalled} pickedUp={user.pickedUp} />;
                        })}
                    </div>
                    <div className="dm-call-bottom-panel">
                        {PickedUp ? (
                            <>
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
                            <p className="handle">@{selected?.handle} - </p>
                            <div className="info-buttons">
                                <a onClick={Call} className="info-button">
                                    <i className="fa-solid fa-phone-volume"></i>
                                </a>
                                <a className="info-button">
                                    <i className="fa-solid fa-video"></i>
                                </a>
                            </div>
                        </div>
                        <div ref={dmContentPanel} className="dm-data">
                            {messages.map((msg) => {
                                return <Message key={msg.msg_id} msg={msg} self_user={self_user} />;
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
                                            placeholder={`Message ${_selected.username}`}
                                        />
                                        <div className="dm-textarea-buttons">
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

                        <DmHomePageDisplay page={homePageEnum} setOptions={setDmSelections} />
                    </div>
                )}
            </div>

            {!userListOpen ? (
                <a onClick={() => setUserListOpen((old) => !old)} className="open-close-dms2">
                    <i className="fa-solid fa-right-to-line"></i>
                </a>
            ) : (
                ""
            )}
        </>
    );
}

function MiddleSide({ handle }: { handle: string }) {
    const [self_user, setSelfUser] = useState<UserPrivate | null>(null);

    useEffect(() => {
        (async () => {
            if (localStorage.getItem("access_token")) {
                setSelfUser(await fetchUserPrivate());
            }
        })();
    }, []);

    return <>{self_user ? <Loaded handle={handle} self_user={self_user} /> : <h1>Loading...</h1>}</>;
}

export default MiddleSide;
