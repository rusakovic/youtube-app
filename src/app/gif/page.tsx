"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getVideoData, saveVideoData, VideoData } from "@/store/videoStore";

/**
 * GIF page of the application.
 * Displays a funny GIF and a button to navigate back to the video page,
 * passing the youtubeID as a query parameter.
 * Updates the system time for the current video before navigating.
 */
const GifPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Handles the back button click.
   * Retrieves the youtubeID from query params. If found, updates its lastKnownSystemTime
   * in localStorage, then navigates back to the video page with that youtubeID.
   */
  const handleBackToVideo = (): void => {
    const currentVideoId = searchParams.get("youtubeID");
    if (currentVideoId) {
      const currentVideoData = getVideoData(currentVideoId);
      if (currentVideoData) {
        const updatedData: VideoData = {
          ...currentVideoData,
          lastKnownSystemTime: Date.now(), // Update system time to now
        };
        saveVideoData(currentVideoId, updatedData);
      }
      router.push(`/video?youtubeID=${currentVideoId}`);
    } else {
      // Fallback if no youtubeID is found, though ideally this shouldn't happen
      console.warn("No youtubeID found on GIF page, navigating to home.");
      router.push("/");
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        paddingTop: "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "30px",
      }}
    >
      <h1>Enjoy this GIF!</h1>
      <div
        style={{
          width: "480px",
          height: "360px",
          position: "relative",
          border: "1px solid #eee",
        }}
      >
        <Image
          src="/funny.gif" // Assuming funny.gif is in the public folder
          alt="Funny GIF"
          layout="fill"
          objectFit="contain"
          unoptimized // If it's an animated GIF, unoptimized might be better
        />
      </div>
      <button
        onClick={handleBackToVideo}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Back to Video
      </button>
    </div>
  );
};

export default GifPage;
