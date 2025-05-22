"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";

// Type definitions for YouTube IFrame Player API
// These are based on the official documentation but might not be exhaustive.

/**
 * Represents the YouTube Player object (YT.Player).
 */
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getPlayerState: () => YTPlayerState;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoUrl: () => string;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getVideoEmbedCode: () => string;
  destroy: () => void;
  addEventListener: <E extends keyof YTPlayerEventMap>(
    event: E,
    listener: YTPlayerEventMap[E]
  ) => void;
  // Add other methods as needed based on usage
  target?: HTMLElement; // The event target (iframe)
}

/**
 * Represents the state of the YouTube player.
 */
enum YTPlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

/**
 * Represents the event object passed to `onReady`.
 */
interface YTOnReadyEvent {
  target: YTPlayer;
}

/**
 * Represents the event object passed to `onStateChange`.
 */
interface YTOnStateChangeEvent {
  data: YTPlayerState;
  target: YTPlayer;
}

// It's good practice to define a map for event listeners if using addEventListener extensively
interface YTPlayerEventMap {
  onReady: (event: YTOnReadyEvent) => void;
  onStateChange: (event: YTOnStateChangeEvent) => void;
  // Add other events like 'onError', 'onPlaybackQualityChange', etc., if needed
}

declare global {
  interface Window {
    YT: {
      Player: new (
        divIdOrPlayerDivRef: string | HTMLDivElement,
        options: YTPlayerOptions
      ) => YTPlayer;
      PlayerState: typeof YTPlayerState;
    };
    onYouTubeIframeAPIReady?: () => void; // Make it optional as it might be set by us
  }
}

/**
 * Options for configuring the YouTube Player.
 */
interface YTPlayerOptions {
  videoId?: string;
  height?: string;
  width?: string;
  playerVars?: YTPlayerVars;
  events?: {
    onReady?: (event: YTOnReadyEvent) => void;
    onStateChange?: (event: YTOnStateChangeEvent) => void;
    // Add other event handlers as needed
  };
}

/**
 * Player variables for customizing the player appearance and behavior.
 */
interface YTPlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  start?: number;
  end?: number;
  loop?: 0 | 1;
  playlist?: string; // Comma-separated video IDs
  enablejsapi?: 0 | 1;
  origin?: string;
  playsinline?: 0 | 1;
  // Add other player variables as needed
}

interface YouTubePlayerComponentProps {
  videoId: string;
  startTimeSeconds: number;
  onTimeUpdate: (currentTimeSeconds: number) => void;
  onPlayerStateChange: (isPlaying: boolean, currentTimeSeconds: number) => void;
  onEdit: () => void;
}

/**
 * Extracts the YouTube video ID from a URL. This function is co-located for convenience but could be in a utils file.
 * @param url - The YouTube video URL.
 * @returns The video ID, or an empty string if not found.
 */
export const getYouTubeId = (url: string): string => {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

let apiScriptLoaded = false;
let apiPromise: Promise<void> | null = null;

/**
 * Loads the YouTube IFrame Player API script asynchronously.
 * Ensures the API script is loaded only once.
 * @returns A promise that resolves when the API is ready.
 */
const ensureYouTubeApiLoaded = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Cannot load YouTube API in non-browser environment")
    );
  }

  if (apiScriptLoaded && window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise<void>((resolve, reject) => {
    // If API is already available (e.g. script manually included or loaded by another instance)
    if (window.YT && window.YT.Player) {
      apiScriptLoaded = true;
      resolve();
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      apiScriptLoaded = true;
      resolve();
    };

    const existingScript = document.getElementById("youtube-iframe-api");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = () =>
        reject(new Error("Failed to load YouTube API script"));
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else if (window.YT && window.YT.Player) {
      // Script exists and API is ready (might happen in some HMR scenarios or race conditions)
      apiScriptLoaded = true;
      resolve();
    } else {
      // Script exists but onYouTubeIframeAPIReady hasn't fired yet. The promise will resolve via the global callback.
      // We rely on the global onYouTubeIframeAPIReady to resolve this promise.
    }
  });

  return apiPromise;
};

/**
 * A React component for embedding and controlling a YouTube video using the IFrame Player API.
 * It handles dynamic loading of the YouTube API, player initialization, state changes, and time updates.
 * @param videoId - The ID of the YouTube video to play.
 * @param startTimeSeconds - The time in seconds from which the video should start playing.
 * @param onTimeUpdate - Callback function triggered periodically (every 3 seconds while playing) with the current video time.
 * @param onPlayerStateChange - Callback function triggered when the player's state (e.g., playing, paused, ended) changes.
 *                            Provides a boolean indicating if the video is currently playing and the current time in seconds.
 * @param onEdit - Callback function triggered when the "Edit URL" button is clicked.
 */
const YouTubePlayer = ({
  videoId,
  startTimeSeconds,
  onTimeUpdate,
  onPlayerStateChange,
  onEdit,
}: YouTubePlayerComponentProps) => {
  const playerInstanceRef = useRef<YTPlayer | null>(null);
  const playerDivContainerRef = useRef<HTMLDivElement>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);

  /**
   * Clears the time update interval.
   */
  const clearTimeUpdateInterval = useCallback(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  }, []);

  /**
   * Sets up an interval to periodically call onTimeUpdate with the current video time.
   * This is active only when the video is playing.
   */
  const setupTimeUpdateInterval = useCallback(() => {
    clearTimeUpdateInterval();
    timeUpdateIntervalRef.current = setInterval(() => {
      if (
        playerInstanceRef.current &&
        typeof playerInstanceRef.current.getCurrentTime === "function"
      ) {
        const currentTime = playerInstanceRef.current.getCurrentTime();
        onTimeUpdate(currentTime);
      }
    }, 1000); // Update every 1 second instead of 3 seconds
  }, [onTimeUpdate, clearTimeUpdateInterval]);

  useEffect(() => {
    /**
     * Initializes the YouTube player once the API is ready.
     */
    const initializePlayer = () => {
      if (
        !isApiReady ||
        !videoId ||
        !playerDivContainerRef.current ||
        playerInstanceRef.current
      ) {
        return;
      }

      playerInstanceRef.current = new window.YT.Player(
        playerDivContainerRef.current,
        {
          videoId: videoId,
          height: "390",
          width: "640",
          playerVars: {
            autoplay: 1, // Autoplay is initiated via onReady event to ensure seekTo works reliably.
            start: Math.floor(startTimeSeconds),
            controls: 1,
            enablejsapi: 1,
            origin: typeof window !== "undefined" ? window.location.origin : "",
            playsinline: 1, // Added for better mobile experience
            // Consider adding rel: 0 to show related videos from the same channel.
          },
          events: {
            /**
             * Handles the onReady event from the YouTube player.
             * Seeks to the specified start time and starts playing the video.
             * @param event - The onReady event object.
             */
            onReady: (event: YTOnReadyEvent) => {
              // For autoplay with a specific start time, using seekTo in onReady is most reliable.
              // Some recommend pause, seek, then play for robustness.
              event.target.pauseVideo(); // Pause briefly
              event.target.seekTo(startTimeSeconds, true); // Seek to desired time
              event.target.playVideo(); // Start playback
            },
            /**
             * Handles the onStateChange event from the YouTube player.
             * Manages time update intervals and calls the onPlayerStateChange prop.
             * @param event - The onStateChange event object.
             */
            onStateChange: (event: YTOnStateChangeEvent) => {
              const currentTime = event.target.getCurrentTime() ?? 0;
              if (event.data === YTPlayerState.PLAYING) {
                onPlayerStateChange(true, currentTime);
                setupTimeUpdateInterval();
              } else if (
                event.data === YTPlayerState.PAUSED ||
                event.data === YTPlayerState.ENDED
              ) {
                clearTimeUpdateInterval();
                onPlayerStateChange(false, currentTime);
              }
            },
          },
        }
      );
    };

    ensureYouTubeApiLoaded()
      .then(() => setIsApiReady(true))
      .catch((error) => console.error("YouTube API Load Error:", error));

    initializePlayer();

    return () => {
      /**
       * Cleans up the player and intervals when the component unmounts or videoId changes.
       */
      clearTimeUpdateInterval();
      if (
        playerInstanceRef.current &&
        typeof playerInstanceRef.current.destroy === "function"
      ) {
        try {
          // playerInstanceRef.current.destroy(); // Destroying can sometimes cause issues with rapid HMR or specific API states.
          // If issues arise, selective cleanup or allowing the iframe to be removed by React might be safer.
        } catch (e) {
          console.warn("Error destroying YouTube player:", e);
        }
        playerInstanceRef.current = null;
      }
    };
  }, [
    isApiReady,
    videoId,
    startTimeSeconds,
    clearTimeUpdateInterval,
    setupTimeUpdateInterval,
    onPlayerStateChange,
  ]); // Key dependencies for re-initialization

  // Effect for cleaning up interval on unmount explicitly.
  useEffect(() => {
    return () => {
      clearTimeUpdateInterval();
    };
  }, [clearTimeUpdateInterval]);

  if (!videoId) {
    // This typically means data is still loading on the parent page or videoId is invalid.
    return (
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Loading player or missing video ID...
      </p>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      {/* The div below will be replaced by the YouTube IFrame */}
      <div
        ref={playerDivContainerRef}
        id={`ytplayer-${videoId}-${Math.random().toString(36).substring(7)}`}
      ></div>
      <button
        onClick={onEdit}
        style={{
          padding: "10px 20px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#0070f3",
          color: "white",
          cursor: "pointer",
        }}
      >
        Edit URL
      </button>
    </div>
  );
};

export default YouTubePlayer;
