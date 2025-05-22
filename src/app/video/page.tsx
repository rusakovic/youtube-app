"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import YouTubePlayer from "@/components/YouTubePlayer";
import { getVideoData, saveVideoData, VideoData } from "@/store/videoStore";
import Link from "next/link";

/**
 * Video page of the application.
 * Displays the YouTube video player based on the youtubeID query parameter.
 * Handles playback time calculation, state persistence, and navigation.
 */
const VideoPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<VideoData | null>(null);
  const [calculatedStartTime, setCalculatedStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    const videoIdFromParams = searchParams.get("youtubeID");

    if (!videoIdFromParams) {
      console.warn("No youtubeID found in query params, redirecting to home.");
      router.replace("/");
      return;
    }

    setCurrentVideoId(videoIdFromParams);
    const videoDetails = getVideoData(videoIdFromParams);

    if (!videoDetails?.originalUrl) {
      console.warn(
        `No video data for ID ${videoIdFromParams}, redirecting to home.`
      );
      router.replace("/");
      return;
    }

    setPlayerData(videoDetails);
    const elapsedSystemTimeSeconds =
      (Date.now() - videoDetails.lastKnownSystemTime) / 1000;
    const newStartTime =
      videoDetails.lastKnownVideoTime + elapsedSystemTimeSeconds;

    setCalculatedStartTime(newStartTime < 0 ? 0 : newStartTime);
    setIsLoading(false);
  }, [searchParams, router]);

  /**
   * Save the current video position when navigating away from the page
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (playerData && currentVideoId && currentTime > 0) {
        const newData: VideoData = {
          ...playerData,
          lastKnownVideoTime: currentTime,
          lastKnownSystemTime: Date.now(),
        };
        saveVideoData(currentVideoId, newData);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload(); // Save position when component unmounts
    };
  }, [playerData, currentVideoId, currentTime]);

  /**
   * Handles updating the video progress in localStorage for the current video ID.
   * @param currentTimeSeconds - The current playback time of the video in seconds.
   */
  const handleTimeUpdate = useCallback(
    (currentTimeSeconds: number): void => {
      setCurrentTime(currentTimeSeconds);
      if (playerData && currentVideoId) {
        const newData: VideoData = {
          ...playerData,
          lastKnownVideoTime: currentTimeSeconds,
          lastKnownSystemTime: Date.now(),
        };
        setPlayerData(newData); // Update local React state for immediate feedback if any
        saveVideoData(currentVideoId, newData);
      }
    },
    [playerData, currentVideoId]
  );

  /**
   * Handles player state changes (playing/paused) to update localStorage for the current video ID.
   * @param isPlaying - True if the video is currently playing, false otherwise.
   * @param currentTimeSeconds - The current playback time when state changed.
   */
  const handlePlayerStateChange = useCallback(
    (isPlaying: boolean, currentTimeSeconds: number): void => {
      if (playerData && currentVideoId) {
        const newData: VideoData = {
          ...playerData,
          lastKnownVideoTime: currentTimeSeconds,
          lastKnownSystemTime: Date.now(), // Always update system time on state change
        };
        setPlayerData(newData);
        saveVideoData(currentVideoId, newData);
      }
    },
    [playerData, currentVideoId]
  );

  const refinedHandleEdit = useCallback((): void => {
    if (playerData?.originalUrl && currentVideoId) {
      saveVideoData(currentVideoId, {
        ...playerData,
        lastKnownSystemTime: Date.now(),
      });
      router.push(`/?url=${encodeURIComponent(playerData.originalUrl)}`);
    } else {
      router.push("/");
    }
  }, [router, playerData, currentVideoId]);

  if (isLoading) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>Loading video...</p>
    );
  }

  if (!playerData || !currentVideoId) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        No video data found or ID missing. <Link href="/">Go Home</Link>
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
        paddingTop: "30px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Video Player
      </h1>
      <YouTubePlayer
        videoId={currentVideoId}
        startTimeSeconds={calculatedStartTime}
        onTimeUpdate={handleTimeUpdate}
        onPlayerStateChange={handlePlayerStateChange}
        onEdit={refinedHandleEdit}
      />
      <Link
        href={`/gif?youtubeID=${currentVideoId}`}
        style={{
          padding: "10px 20px",
          borderRadius: "4px",
          backgroundColor: "#28a745",
          color: "white",
          textDecoration: "none",
        }}
      >
        Go to GIF Page
      </Link>
    </div>
  );
};

/**
 * Video page of the application.
 * Wraps the main content in a Suspense boundary.
 */
const VideoPage = () => {
  return (
    <Suspense
      fallback={
        <p style={{ textAlign: "center", marginTop: "50px" }}>
          Loading video page...
        </p>
      }
    >
      <VideoPageContent />
    </Suspense>
  );
};

export default VideoPage;
