export type PlaybackState = {
	videoId: string | null;
	position: number; // position in seconds
	isPlaying: boolean;
	updatedAt: number;
};

export type PlayPayload = { position: number };
export type PausePayload = { position: number };
export type SeekPayload = { position: number };
export type ChangeVideoPayload = { videoId: string };