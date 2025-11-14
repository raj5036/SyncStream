export type PlaybackState = {
	videoId: string | null;
	position: number; // seconds
	isPlaying: boolean;
	updatedAt: number;
};

export type PlayPayload = { position: number };
export type PausePayload = { position: number };
export type SeekPayload = { position: number };
export type ChangeVideoPayload = { videoId: string };

export type ServerToClientEvents = {
	sync: (state: PlaybackState) => void;
	play: (payload: PlayPayload) => void;
	pause: (payload: PausePayload) => void;
	seek: (payload: SeekPayload) => void;
	changeVideo: (payload: ChangeVideoPayload) => void;
	userCounts: (count: number) => void;
};

export type ClientToServerEvents = {
	requestSync: () => void;
	play: (payload: PlayPayload) => void;
	pause: (payload: PausePayload) => void;
	seek: (payload: SeekPayload) => void;
	changeVideo: (payload: ChangeVideoPayload) => void;
};
