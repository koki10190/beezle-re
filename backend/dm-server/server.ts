import dotenv from "dotenv";
dotenv.config();
import express from "express";
import https from "https";
import { Server, Socket } from "socket.io";
import cors from "cors";
import mongoose, { mongo } from "mongoose";
import MessageDM from "./schema/MessageDM";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { ExpressPeerServer, PeerServer } from "peer";
import fs from "fs";

const UserModel = mongoose.model("User", {} as any, "Users");
const app = express();
const ssl_options = {
    key: process.env["USE_SSL"] === "yes" ? fs.readFileSync("../priv.key").toString() : "",
    cert: process.env["USE_SSL"] === "yes" ? fs.readFileSync("../cert.crt").toString() : "",
};

const server = https.createServer(ssl_options as any, app);
const peerServer = ExpressPeerServer(server);
app.use("/calling", peerServer);

process.on("uncaughtException", function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
});

const db = mongoose.connect(process.env["MONGO_URI"] as string).then(() => console.log("Connected to MongoDB"));

server.listen(process.env["PORT"], () => console.log("DM Server On"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    cors({
        origin: true,
    }),
);

app.get("/", (req, res) => {
    res.send("DM Server");
});

app.get("/message/:id", async (req, res) => {
    const { id } = req.params;
    console.log(req.params);
    const token = req.headers.authorization;
    if (!token) res.status(404).send("no auth header");
    const decoded = jwt.verify(token!, process.env["TOKEN_SECRET"] as string) as jwt.JwtPayload;

    const msg = await MessageDM.findOne({
        channel: { $regex: `(${decoded.handle};|;${decoded.handle})` },
        msg_id: id,
    });
    console.log(`(${decoded.handle};|;${decoded.handle})`, id, await MessageDM.findOne({ msg_id: id }));
    console.log(msg);

    return res.json(msg);
});

app.get("/status/:handle", async (req, res) => {
    const { handle } = req.params;
    console.log(req.params);
    // const token = req.headers.authorization;
    // if (!token) res.status(404).send("no auth header");
    // const decoded = jwt.verify(token!, process.env["TOKEN_SECRET"] as string) as jwt.JwtPayload;

    if (sockets_handle.get(handle)) {
        const user = await UserModel.findOne({ handle });
        return res.json(user.get("status").replace('"', ""));
    } else return res.json({ status: "offline" });
});

const sockets: Map<string, { socket: Socket; id: string; handle: string }> = new Map();
const sockets_handle: Map<string, { socket: Socket; id: string; handle: string }> = new Map();

io.on("connection", (socket) => {
    console.log("a user has connected");

    socket.on("disconnect", () => {
        console.log("User Disconnected " + socket.id);

        sockets.delete(socket.id);
    });

    socket.on("beezle-connect", (token) => {
        try {
            const decoded = jwt.verify(token, process.env["TOKEN_SECRET"] as string) as jwt.JwtPayload;
            console.log("BEEZLE Connection:", decoded.handle);
            sockets.set(socket.id, { socket, id: socket.id, handle: decoded.handle });
            sockets_handle.set(decoded.handle, { socket, id: socket.id, handle: decoded.handle });
        } catch (err) {
            console.error(err);
            console.log("Invalid token dooodoo");
        }
        // console.log("Connection:", handle);
        // sockets.push({ socket, id: socket.id, handle });
    });

    socket.on("message", async (msg: any, self_user: any, to: string) => {
        const user = sockets_handle.get(to);

        const id = randomUUID();
        const db_msg = await MessageDM.create({
            author: msg.author,
            content: msg.content,
            timestamp: new Date(),
            msg_id: id,
            edited: false,
            replying_to: msg.replying_to ?? undefined,
            channel: `${to};${msg.author}`,
        });
        console.log(db_msg, db_msg.collection.name);
        console.log("Received a message from", msg.author, "to", to, "userfind:", user ? "true" : "false");
        socket.emit("message-receive", db_msg);
        if (!user) return;
        msg.msg_id = id;
        console.log("emitting....");
        user.socket.emit("message-receive", db_msg);
    });

    // Handle Calls
    socket.on("call-change-settings", (settings: { video: boolean; muted: boolean }, peer_handle: string) => {
        const user = sockets_handle.get(peer_handle);
        if (!user) return console.log("call-change-settings: No User Found");

        user.socket.emit("call-change-settings", settings, sockets.get(socket.id)?.handle);
    });

    socket.on("delete-message", async (msg_id: string) => {
        const sckt = sockets.get(socket.id);

        const doc = await MessageDM.findOne({ author: sckt?.handle, msg_id });
        const deleted_msg = await MessageDM.deleteOne({
            author: sckt?.handle,
            msg_id,
        });

        const channels = doc?.channel.split(";");
        channels?.forEach((user) => {
            if (user === sckt?.handle) return;

            const other_sckt = sockets_handle.get(user);
            if (other_sckt) {
                other_sckt.socket.emit("message-deleted", msg_id);
            }
        });
    });

    socket.on("edit-message", async (msg_id: string, content: string) => {
        const sckt = sockets.get(socket.id);

        const doc = await MessageDM.findOne({ author: sckt?.handle, msg_id });
        const edited_msg = await MessageDM.updateOne(
            {
                author: sckt?.handle,
                msg_id,
            },
            { content, edited: true },
        );

        const channels = doc?.channel.split(";");
        channels?.forEach((user) => {
            console.log(user);
            if (user === sckt?.handle) return;

            const other_sckt = sockets_handle.get(user);
            if (other_sckt) {
                console.log("emitting message-edited", doc?.msg_id, content);
                other_sckt.socket.emit("message-edited", doc?.msg_id, content);
            }
        });
    });
});
