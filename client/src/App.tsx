import { useEffect, useRef, useState } from "react";
import socket from "./config/socket.config";
import type { PlaybackState } from "./types/socket";
import type { YouTubeEvent, YouTubePlayer, YouTubeProps } from "react-youtube";
import { parseYouTubeId } from "./utils/youtube";
import YouTube from "react-youtube";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "./App.css";

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
    if (!url || !videoId) {
      toast.error("Please add a video url first");
    }

    if (applyingRemoteRef.current) return;
    socket.emit("play", { position: await getCurrent() });
  };

  const handlePause = async () => {
    if (!url || !videoId) {
      toast.error("Please add a video url first");
    }

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
      toast.error("Please enter a valid YouTube URL or 11-char video ID");
      return;
    }
    socket.emit("changeVideo", { videoId: id });
    setUrl("");
  };

  const seekBy = async (sec: number) => {
    if (!url || !videoId) {
      toast.error("Please add a video url first");
    }
    
    if (!playerRef.current) return;
    const current = await getCurrent();
    const pos = Math.max(0, current + sec);
    playerRef.current.seekTo(pos, true);
    if (!applyingRemoteRef.current) socket.emit("seek", { position: pos });
  };

  return (
    <div className="app-container">
      <h1 className="title">Watch Party<span className="highlight"> • Global Session</span></h1>

      <div className="input-group">
        <input
          className="input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL or ID"
        />
        <button className="load-btn" onClick={changeVideo}>Load</button>
      </div>

      <div className="player-wrapper">
        {videoId ? (
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onPlay={handlePlay}
            onPause={handlePause}
            onStateChange={onStateChange}
            className="player"
          />
        ) : (
          <p className="placeholder">Load a video to begin 🎬</p>
        )}
      </div>

      <div className="controls">
        <button onClick={handlePlay}>▶ Play</button>
        <button onClick={handlePause}>⏸ Pause</button>
        <button onClick={() => seekBy(-10)}>⏪ -10s</button>
        <button onClick={() => seekBy(10)}>⏩ +10s</button>
      </div>
      <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
      />
    </div>
  )
};

export default App;