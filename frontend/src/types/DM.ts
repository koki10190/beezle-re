import { io } from "socket.io-client";
import { dm_uri } from "../links";

const dmSocket = io("wss://server.beezle.lol", { transports: ["polling"] });
export default dmSocket;
