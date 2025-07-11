import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { DMData } from "./DM";
import axios from "axios";
import { UserPublic } from "./UserType";
import mongoose from "mongoose";
import dotenv from "dotenv";
import DM from "./models/DM";
dotenv.config();

process.on("uncaughtException", function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

mongoose
    .connect(process.env["MONGO_URI"] as string)
    .then(() => console.log("Connected to MongoDB"))
    .catch(() => console.log("Failed to connect to MongoDB"));

const production_mode = false;
const api_uri = production_mode ? "https://server.beezle.lol:3000" : "http://localhost:3000";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const connectedSockets = new Map<string, { handle: string; socket: Socket }>();
const socketIDs = new Map<string, string>();

server.listen(3001, () => {
    console.log("[BEEZLE] Server Started!");
});

app.get("/", (req: Request, res: Response) => {
    res.send("Test!");
});

io.on("connection", (socket) => {
    console.log("User connected! ID:", socket.id);

    socket.on("get handle", (handle: string) => {
        socketIDs.set(handle, socket.id);
        connectedSockets.set(socket.id, { handle, socket });
        console.log("Got handle:", handle);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected! ID:", socket.id);
        connectedSockets.delete(socket.id);
    });

    socket.on("get messages", async (from: string, to: string) => {
        const sender = connectedSockets.get(socket.id)!;
        if (from !== sender.handle && to !== sender.handle) return socket.emit("receive messages", []);
        const dms = await DM.find({
            $or: [
                {
                    "from.handle": from,
                    "to.handle": to,
                },
                {
                    "from.handle": to,
                    "to.handle": from,
                },
            ],
        });

        socket.emit("receive messages", dms);
    });

    socket.on("send message", async (to: string, content: string) => {
        const sender = connectedSockets.get(socket.id)!;
        const from_user = (await axios.get(`${api_uri}/api/get_user?handle=${sender.handle}`)).data as UserPublic;
        const receiver = connectedSockets.get(socketIDs.get(to)!)!;
        if (!sender) return console.error("[ERROR] No sender found!");
        if (!receiver) {
            const to_user = (await axios.get(`${api_uri}/api/get_user?handle=${to}`)).data as UserPublic;
            const dm = await DM.create({
                from: from_user,
                to: to_user,
                content,
                date: new Date(),
                edited: false,
            });
            sender.socket.emit("receiver not found client add", dm);
            return console.error("[ERROR] No receiver found!");
        }

        console.log(`${api_uri}/api/get_user?handle=${receiver.handle}`);
        const to_user = (await axios.get(`${api_uri}/api/get_user?handle=${receiver.handle}`)).data as UserPublic;

        receiver.socket.emit("get message", {
            to: to_user,
            from: from_user,
            content,
            date: new Date(),
            edited: false,
        } as DMData);
        sender.socket.emit("get message", {
            to: to_user,
            from: from_user,
            content,
            date: new Date(),
            edited: false,
        } as DMData);

        const dm = await DM.create({
            from: from_user,
            to: to_user,
            content,
            date: new Date(),
            edited: false,
        });
    });

    socket.on("edit message", async (cntc_handle: string, id: string, new_content: string) => {
        console.log(cntc_handle, id, new_content);
        const dm = await DM.findByIdAndUpdate(id, { content: new_content, edited: true });
        if (!dm) return console.log("Failed to update message with ID", id);

        const sender = connectedSockets.get(socket.id)!;
        const from_user = (await axios.get(`${api_uri}/api/get_user?handle=${sender.handle}`)).data as UserPublic;
        const receiver = connectedSockets.get(socketIDs.get(cntc_handle)!)!;

        if (receiver) {
            const to_user = (await axios.get(`${api_uri}/api/get_user?handle=${receiver.handle}`)).data as UserPublic;
            receiver.socket.emit("message edited", dm?._id, dm);
        }
        dm.content = new_content;

        sender.socket.emit("message edited", dm?._id, dm);
    });
});
