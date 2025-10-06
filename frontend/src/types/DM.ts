import { io } from "socket.io-client";
import { dm_uri } from "../links";

const dmSocket = io(dm_uri, { secure: true });
export default dmSocket;
