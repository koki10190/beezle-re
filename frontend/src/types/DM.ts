import { io } from "socket.io-client";
import { dm_uri } from "../links";

const dmSocket = io("wss://server.beezle.lol", { port: 443, secure: true });
export default dmSocket;
