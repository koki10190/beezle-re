import dotenv from "dotenv";
dotenv.config();
import express from "express";
import https from "https";
import { Server, Socket } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import MessageDM from "./schema/MessageDM";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { ExpressPeerServer, PeerServer } from "peer";
import fs from "fs";

const app = express();
const ssl_options = {
    key: process.env["USE_SSL"] === "yes" ? fs.readFileSync("../priv.key").toString() : "",
    cert: process.env["USE_SSL"] === "yes" ? fs.readFileSync("../cert.crt").toString() : "",
};

const server = https.createServer(ssl_options as any, app);
const peerServer = ExpressPeerServer(server);
app.use("/calling", peerServer);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const db = mongoose.connect(process.env["MONGO_URI"] as string).then(() => console.log("Connected to MongoDB"));

server.listen(process.env["PORT"], () => console.log("DM Server On"));

app.use(express.json());
app.use(
    cors({
        origin: true,
    }),
);

app.get("/", (res, req) => {
    res.body("DM Server");
});

const sockets: Array<{ socket: Socket; id: string; handle: string }> = [];

io.on("connection", (socket) => {
    console.log("a user has connected");

    socket.on("disconnect", () => {
        console.log("User Disconnected " + socket.id);

        const skt = sockets.findIndex((x) => x.id === socket?.id);
        if (skt > -1) {
            sockets.splice(skt, 1);
        }
    });

    socket.on("beezle-connect", (token) => {
        try {
            const decoded = jwt.verify(token, process.env["TOKEN_SECRET"] as string) as jwt.JwtPayload;
            console.log("BEEZLE Connection:", decoded.handle);
            sockets.push({ socket, id: socket.id, handle: decoded.handle });
        } catch (err) {
            console.error(err);
            console.log("Invalid token dooodoo");
        }
        // console.log("Connection:", handle);
        // sockets.push({ socket, id: socket.id, handle });
    });

    socket.on("message", async (msg: any, self_user: any, to: string) => {
        const user = sockets.find((x) => x.handle === to);
        console.log(sockets);

        const id = randomUUID();
        const db_msg = await MessageDM.create({
            author: msg.author,
            content: msg.content,
            timestamp: new Date(),
            msg_id: id,
            channel: `${to};${msg.author}`,
        });
        if (!user) return;
        msg.msg_id = id;
        user.socket.emit("message-receive", msg);
    });
});
