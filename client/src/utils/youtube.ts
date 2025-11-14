export const parseYouTubeId = (input: string): string | null => {
	try {
		// Handle raw ID
		if (/^[\w-]{11}$/.test(input)) return input;

		const u = new URL(input);
		if (u.hostname === "youtu.be") {
			return u.pathname.slice(1) || null;
		}
		if (u.searchParams.get("v")) {
			return u.searchParams.get("v");
		}
		// Shorts /embed patterns fallback
		const paths = u.pathname.split("/").filter(Boolean);
		const idx = paths.findIndex(p => p === "embed" || p === "shorts");
		if (idx >= 0 && paths[idx + 1]) return paths[idx + 1];
		return null;
	} catch {
		return null;
	}
};

export const isValidVideoId = (videoId: string | null): boolean => {
	return videoId !== "" && videoId !== null;
};
