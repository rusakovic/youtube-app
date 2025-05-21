"use client";

import { useRouter, useSearchParams } from "next/navigation";
import YouTubeForm from "@/components/YouTubeForm";
import {
  saveVideoData,
  VideoData,
  getYouTubeIdFromUrl,
  getVideoData,
} from "@/store/videoStore";
import { useEffect, useState } from "react";

/**
 * Home page of the application.
 * Displays a form to enter a YouTube video URL.
 * The form can be pre-filled using a 'url' query parameter.
 */
const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialUrl, setInitialUrl] = useState<string>("");

  useEffect(() => {
    // Pre-fill the form if a 'url' query parameter is present
    const urlFromQuery = searchParams.get("url");
    if (urlFromQuery) {
      setInitialUrl(decodeURIComponent(urlFromQuery));
    }
  }, [searchParams]);

  /**
   * Handles saving the YouTube URL.
   * Extracts the video ID, saves video data to localStorage under the video ID,
   * and navigates to the video page with the youtubeID as a query parameter.
   * @param url - The YouTube video URL to save.
   */
  const handleSaveUrl = async (url: string): Promise<void> => {
    const videoId = getYouTubeIdFromUrl(url);
    if (!videoId) {
      console.error("Could not extract video ID from URL:", url);
      return;
    }

    const existingVideoData = getVideoData(videoId);
    let videoDataToSave: VideoData;

    if (existingVideoData) {
      videoDataToSave = {
        ...existingVideoData,
        originalUrl: url,
        lastKnownSystemTime: Date.now(),
      };
    } else {
      videoDataToSave = {
        originalUrl: url,
        lastKnownVideoTime: 0,
        lastKnownSystemTime: Date.now(),
      };
    }

    saveVideoData(videoId, videoDataToSave);
    router.push(`/video?youtubeID=${videoId}`); // Navigate with youtubeID query parameter
  };

  return (
    <div style={{ paddingTop: "50px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        YouTube Video Player
      </h1>
      <YouTubeForm onSave={handleSaveUrl} initialUrl={initialUrl} />
    </div>
  );
};

export default HomePage;
