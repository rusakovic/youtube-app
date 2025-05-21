"use client";

import { useState, FormEvent, useEffect } from "react";

interface YouTubeFormProps {
  onSave: (url: string) => void;
  initialUrl?: string;
}

const YOUTUBE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11}).*$/;

/**
 * A form component for users to input a YouTube video URL.
 * @param onSave - Callback function triggered when the form is submitted with a valid URL.
 * @param initialUrl - Optional initial value for the URL input field.
 */
const YouTubeForm = ({ onSave, initialUrl = "" }: YouTubeFormProps) => {
  const [videoUrl, setVideoUrl] = useState<string>(initialUrl);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setVideoUrl(initialUrl);
  }, [initialUrl]);

  /**
   * Handles the form submission.
   * Validates the URL and calls the onSave callback if valid.
   * @param event - The form submission event.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!videoUrl.trim()) {
      setError("Please enter a YouTube video URL.");
      return;
    }
    if (!YOUTUBE_URL_REGEX.test(videoUrl)) {
      setError("Please enter a valid YouTube video URL.");
      return;
    }
    setError("");
    onSave(videoUrl);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      <label htmlFor="youtube-url">YouTube Video URL:</label>
      <input
        id="youtube-url"
        type="text"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Enter YouTube video URL"
        style={{
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        type="submit"
        style={{
          padding: "10px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#0070f3",
          color: "white",
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </form>
  );
};

export default YouTubeForm;
