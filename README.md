# YouTube Video Player App

A simple Next.js application that allows users to input a YouTube video URL, autoplays the video, and remembers the playback position based on elapsed real-time.

## Features

-   Input a YouTube video URL.
-   Video autoplays upon saving the URL.
-   Remembers the video's playback position: If you navigate away and return, the video will resume from where it would be if it had played continuously during your absence.
-   Edit the saved YouTube URL.
-   A separate page with a funny GIF and a button to navigate back to the video.

## Prerequisites

-   Node.js (v18.x or later recommended)
-   pnpm (or npm/yarn)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd youtube-app
    ```

2.  **Install dependencies:**
    Using pnpm (recommended):
    ```bash
    pnpm install
    ```
    Or using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

## Running the App

1.  **Start the development server:**
    Using pnpm:
    ```bash
    pnpm dev
    ```
    Or using npm:
    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn dev
    ```

2.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Project Structure

-   `src/app/page.tsx`: Home Page (initial form state)
-   `src/app/video/page.tsx`: Video Page (playback state)
-   `src/app/gif/page.tsx`: GIF Page
-   `src/components/YouTubeForm.tsx`: Form component for URL input
-   `src/components/YouTubePlayer.tsx`: Video player component
-   `src/store/videoStore.ts`: Handles `localStorage` interaction for video state
-   `public/funny.gif`: The GIF displayed on the GIF page (replace with an actual GIF).

## Assumptions

-   The user's browser supports `localStorage` for remembering the video state.
-   The `react-youtube` package is used for embedding the YouTube player.

## Replacing the GIF

The file `public/funny.gif` is a placeholder. Please replace it with an actual funny GIF to be displayed on the GIF page.
