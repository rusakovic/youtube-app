import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Ensures it imports from src/app/globals.css

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YouTube Video Player App",
  description: "A simple app to play YouTube videos with position memory.",
};

/**
 * Root layout for the application.
 * @param children - The child components to render within the layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main style={{ padding: "20px" }}>{children}</main>
      </body>
    </html>
  );
}
