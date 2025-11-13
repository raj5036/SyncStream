declare namespace YT {
	interface Player {
		playVideo(): void;
		pauseVideo(): void;
		seekTo(seconds: number, allowSeekAhead: boolean): void;
		getCurrentTime(): number;
		getDuration(): number;
	}
}
