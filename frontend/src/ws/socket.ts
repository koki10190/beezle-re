import { toast } from "react-toastify";
import { ws_uri } from "../links";
import { SERVER_ONLINE, ServerDownMessage, SetServerStatus } from "../functions/CheckServerStatus";
import { fetchUserPrivate } from "../functions/fetchUserPrivate";

type ChannelCallback = (data: object) => void;

class Channel {
    channel: string;
    callback: ChannelCallback;

    constructor(ch: string, cb: ChannelCallback) {
        this.channel = ch;
        this.callback = cb;
    }
}

class BeezleSocket {
    webSocket: WebSocket;
    channels: Map<string, Channel>;
    interval: NodeJS.Timeout;

    constructor() {
        this.Init();
    }

    public Init(msg = true, success = false) {
        clearInterval(this.interval);

        this.channels = new Map();
        this.webSocket = new WebSocket(ws_uri);

        console.log("Web Socket connected!");

        this.webSocket.onmessage = (msg: MessageEvent<any>) => {
            const { channel, data } = JSON.parse(msg.data as string);
            // console.log(`Got a message for "${channel}", data:`, data);
            if (this.channels.get(channel)) {
                this.channels.get(channel).callback(data);
            }
        };

        this.webSocket.onopen = async () => {
            let _ = setInterval(async () => {
                const user = await fetchUserPrivate();
                if (!user) return;
                localStorage.setItem("user_handle", user.handle);

                if (success) {
                    toast.success("Connection regained!");
                    msg = true;
                }

                socket.send("connect", {
                    handle: user.handle,
                });

                console.log("Connected, sent a ping");
                clearInterval(_);
                console.log("Intervalling Socket Connection..");

                this.interval = setInterval(() => {
                    socket.send("connect", {
                        handle: user.handle,
                    });
                }, 5000);
            }, 100);
        };

        this.webSocket.onclose = () => {
            SetServerStatus(false);
            if (msg) ServerDownMessage();
            if (window.location.pathname != "/") {
                setTimeout(() => {
                    this.Init(false, true);
                }, 1000);
            }
        };

        this.webSocket.onerror = (err) => {
            // if (msg) toast.error(`Web Socket threw an error, check the console.`);
            console.error("WS THREW AN ERROR:", err);
        };

        // this.listen("pong", () => {
        //     // console.log("Got a pong, sending a ping");
        //     setTimeout(() => this.send("ping", { handle: localStorage.getItem("user_handle") }), 5000);
        // });

        // this.listen("ping", () => {
        //     // console.log("Got a ping, sending a pong");
        //     setTimeout(() => this.send("pong", {}), 5000);
        // });
    }

    public send(channel: string, data: object) {
        this.webSocket.send(JSON.stringify({ channel, data }));
    }

    public listen(channel: string, callback: ChannelCallback) {
        this.channels.set(channel, {
            channel,
            callback,
        });
    }
}

const socket = new BeezleSocket();
export { BeezleSocket, socket };
