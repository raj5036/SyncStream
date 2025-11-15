import "dotenv/config";

import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { ClientToServerEvents, ServerToClientEvents } from "./types/events.types";
import { DisconnectReason, Server } from "socket.io";
import { PlaybackState } from "./types/playback.types";
import path from "path";

const app = express();
const PORT = process.env.PORT || "5000";
const clientBuildPath = path.join(__dirname, "../../client/dist");

app.use(express.json());
app.use(cors());
app.use(express.static(clientBuildPath));
app.get("/", (req: Request, res: Response) => {
	res.send("Server is running");
});
app.get("/{*splat}", (_req, res) => {
	res.sendFile(path.join(clientBuildPath, "index.html"));
});

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
	pingInterval: 5000,
	pingTimeout: 5000,
});

// --- Global session (single room) ---
let state: PlaybackState = {
	videoId: null,
	position: 0,
	isPlaying: false,
	updatedAt: Date.now()
};

const effectivePosition = (s: PlaybackState) => {
	if (!s.isPlaying) return s.position;
	const elapsed = (Date.now() - s.updatedAt) / 1000;
	return s.position + elapsed;
};

io.on("connection", (socket) => {
	console.log("[SERVER] Client connected", socket.id);
	
	io.emit("userCounts", io.engine.clientsCount);

	socket.emit("sync", {
		...state,
		position: effectivePosition(state)
	});

	socket.on("requestSync", () => {
		socket.emit("sync", {
			...state,
			position: effectivePosition(state)
		})
	});

	socket.on("play", ({ position }) => {
		console.log("Play")
		state = {
			...state,
			isPlaying: true,
			position,
			updatedAt: Date.now()
		};
		io.emit("play", { position });
	});

	socket.on("pause", ({ position }) => {
		state = {
			...state,
			isPlaying: false,
			position,
			updatedAt: Date.now()
		};
		io.emit("pause", { position });
	});

	socket.on("seek", ({ position }) => { 
		state = {
			...state,
			position,
			updatedAt: Date.now()
		};
		io.emit("seek", { position });
	});

	socket.on("changeVideo", ({ videoId }) => {
		state = {
			videoId,
			position: 0,
			isPlaying: false,
			updatedAt: Date.now()
		};
		io.emit("changeVideo", { videoId });
		
		// After change, send a fresh sync so late joiners get position 0
		io.emit("sync", state);
	});

	socket.on("disconnect", (reason: DisconnectReason) => {
		io.emit("userCounts", io.engine.clientsCount);

		console.log("[SERVER] disconnected:", socket.id, "reason:", reason, "total:", io.engine.clientsCount);
	});
});

server.listen(PORT, () => {
	console.log("Server running on: ", PORT); 
});