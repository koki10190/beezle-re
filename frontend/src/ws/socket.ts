import { toast } from "react-toastify";
import { ws_uri } from "../links";
import { SERVER_ONLINE, ServerDownMessage, SetServerStatus } from "../functions/CheckServerStatus";

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

    constructor() {
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

        this.webSocket.onclose = () => {
            SetServerStatus(false);
            ServerDownMessage();
            if (window.location.pathname != "/") {
                setTimeout(() => {
                    // window.location.pathname = "/";
                }, 1000);
            }
        };
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
