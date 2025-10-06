import { io } from "socket.io-client";
import { dm_uri } from "../links";

const dmSocket = io(dm_uri, { transports: ["polling"] });
export default dmSocket;
