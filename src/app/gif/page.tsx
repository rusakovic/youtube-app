"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * Content of the GIF page, responsible for displaying the GIF and handling navigation.
 * This component uses client-side hooks like useSearchParams.
 */
const GifPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Handles the back button click.
   * Retrieves the youtubeID from query params. If found, navigates back to the video page with that youtubeID.
   * The video time position has already been saved periodically during playback on the video page.
   */
  const handleBackToVideo = (): void => {
    const currentVideoId = searchParams.get("youtubeID");
    if (currentVideoId) {
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
          src="/gif/funny.gif" // Assuming funny.gif is in the public folder
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

/**
 * GIF page of the application.
 * Wraps the main content in a Suspense boundary to handle client-side rendering
 * of components using hooks like useSearchParams.
 */
const GifPage = () => {
  return (
    <Suspense
      fallback={
        <p style={{ textAlign: "center", marginTop: "50px" }}>
          Loading GIF page...
        </p>
      }
    >
      <GifPageContent />
    </Suspense>
  );
};

export default GifPage;
