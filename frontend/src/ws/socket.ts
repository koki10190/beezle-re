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
        this.webSocket = new WebSocket("ws://localhost:3000/ws");
        this.channels = new Map();

        this.webSocket.onmessage = (msg: MessageEvent<any>) => {
            const [channel, json_data] = (msg.data as string).split(";:;;:;");

            this.channels.forEach((ch: Channel) => {
                if (ch.channel == channel) {
                    ch.callback(JSON.parse(json_data));
                }
            });
        };
    }

    send<DataType = object>(channel: string, data: DataType) {
        this.webSocket.send(`${channel};:;;:;${JSON.stringify(data)}`);
    }

    listen<DataType = object>(channel: string, callback: ChannelCallback) {
        this.channels.set(channel, new Channel(channel, callback));
    }
}

export default BeezleSocket;
