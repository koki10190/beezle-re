import { io } from "socket.io-client";
import { dm_uri } from "../links";

const dmSocket = io("https://server.beezle.lol", { transports: ["polling"] });
export default dmSocket;
