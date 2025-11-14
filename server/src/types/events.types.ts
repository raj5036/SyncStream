import { ChangeVideoPayload, PausePayload, PlaybackState, PlayPayload, SeekPayload } from "./playback.types";

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