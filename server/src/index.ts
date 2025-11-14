import "dotenv/config";

import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { ClientToServerEvents, ServerToClientEvents } from "./types/events.types";
import { Server } from "socket.io";
import { PlaybackState } from "./types/playback.types";

const app = express();
const PORT = process.env.PORT || "5000";

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"]
	},
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
});

app.get("/", (req: Request, res: Response) => {
	res.send("Server is running");
});

server.listen(PORT, () => {
	console.log("Server running on: ", PORT); 
});