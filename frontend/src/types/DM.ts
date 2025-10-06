import { io } from "socket.io-client";
import { dm_uri } from "../links";

const dmSocket = io("https://server.beezle.lol", { port: 3001, secure: true, transports: ["websocket"] });
export default dmSocket;
