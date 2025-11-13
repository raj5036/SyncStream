import { useEffect, useRef, useState } from "react";
import socket from "./config/socket.config";
import type { PlaybackState } from "./types/socket";
import type { YouTubeEvent, YouTubePlayer, YouTubeProps } from "react-youtube";
import { parseYouTubeId } from "./utils/youtube";
import YouTube from "react-youtube";

const App = () => {
  const [videoId, setVideoId] = useState<string | null>("");
  const [url, setUrl] = useState<string>("");
  // const [connectedCount, setConnectedCount] = useState<number>(0);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const applyingRemoteRef = useRef(false);

  useEffect(() => {
    socket.on("sync", (s: PlaybackState) => {
      setVideoId(s.videoId);

      if (playerRef.current && s.videoId) {
        const target = s.position ?? 0;
        playerRef.current.seekTo(target, true);

        if (s.isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      }

      // Small timeout lets YouTube settle before we allow local emits again
      setTimeout(() => (applyingRemoteRef.current = false), 100);
    });

    socket.on("play", (data) => {
      console.log("[CLIENT] play received:", data);

      const { position } = data;
      if (!playerRef.current) return;
      applyingRemoteRef.current = true;
      playerRef.current.seekTo(position, true);
      playerRef.current.playVideo();
      setTimeout(() => (applyingRemoteRef.current = false), 100);
    });

    socket.on("pause", (data) => {
      console.log("[CLIENT] pause received:", data);
      
      const { position } = data;
      if (!playerRef.current) return;
      applyingRemoteRef.current = true;
      
      playerRef.current.seekTo(position, true);
      playerRef.current?.pauseVideo();
      setTimeout(() => (applyingRemoteRef.current = false), 100);
    });

    socket.on("seek", (data) => {
      console.log("[CLIENT] seek received:", data);
      
      const { position } = data;
      if (!playerRef.current) return;
      applyingRemoteRef.current = true;

      playerRef.current.seekTo(position, true);
      setTimeout(() => (applyingRemoteRef.current = false), 100);
    });

    socket.on("changeVideo", (data) => {
      console.log("[CLIENT] play received:", data);
      
      const { videoId } = data;
      setVideoId(videoId);
    });

    // On mount, ensure we’re synced
    socket.emit("requestSync");

    return () => {
      socket.off("sync");
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
      socket.off("changeVideo");
    };
  }, [])

  const opts: YouTubeProps["opts"] = {
    height: "390",
    width: "640",
    playerVars: { 
      autoplay: 0,
      color: "red",
      controls: 1,
    }
  };

  const onReady = (e: YouTubeEvent<any>) => {
    playerRef.current = e.target as YouTubePlayer;
    
    socket.emit("requestSync");
  };

  const getCurrent = () => playerRef.current?.getCurrentTime() ?? 0;

  const handlePlay = async () => {
    if (applyingRemoteRef.current) return;
    socket.emit("play", { position: await getCurrent() });
  };

  const handlePause = async () => {
    if (applyingRemoteRef.current) return;
    socket.emit("pause", { position: await getCurrent() });
  };

  // Fired for many state changes; we only care about SEEK
  const onStateChange = async (e: YouTubeEvent<number>) => {
    if (applyingRemoteRef.current) return;
    // Player state 1 = playing, 2 = paused, 3 = buffering, etc.
    // We’ll treat manual scrubs as "seek" by comparing onMouseUp handlers or using this simple emit:
    const position = await getCurrent();
    // Emit a seek on buffering (3) or unclassified changes; harmless if not actually a seek
    if (e.data === 3) {
      socket.emit("seek", { position });
    }
  };

  const changeVideo = () => {
    const id = parseYouTubeId(url);
    if (!id) {
      alert("Please enter a valid YouTube URL or 11-char video ID");
      return;
    }
    socket.emit("changeVideo", { videoId: id });
    setUrl("");
  };

  return (
    <div style={{ maxWidth: 880, margin: "32px auto", padding: 16 }}>
      <h2>Watch Party (Global Session)</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL or ID"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={changeVideo}>Load</button>
      </div>

      {videoId ? (
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onPlay={handlePlay}
          onPause={handlePause}
          onStateChange={onStateChange}
        />
      ) : (
        <p>Load a video to begin.</p>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button
          onClick={async () => {
            if (!playerRef.current) return;
            const pos = Math.max(0, await getCurrent() - 10);
            playerRef.current.seekTo(pos, true);
            if (!applyingRemoteRef.current) socket.emit("seek", { position: pos });
          }}
        >
          -10s
        </button>
        <button
          onClick={async () => {
            if (!playerRef.current) return;
            const pos = await getCurrent() + 10;
            playerRef.current.seekTo(pos, true);
            if (!applyingRemoteRef.current) socket.emit("seek", { position: pos });
          }}
        >
          +10s
        </button>
      </div>
    </div>
  )
};

export default App;