import { io, Socket } from "socket.io-client";

const dmSocket = io("http://localhost:3001");
export default dmSocket;
