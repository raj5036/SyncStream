import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/socket";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
	import.meta.env.VITE_WS_URL || "http://localhost:5000",
	{ transports: ["websocket"] }
);

export default socket;