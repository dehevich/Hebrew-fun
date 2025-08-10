import type { Metadata, Viewport } from "next"; // Import Viewport type
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hebrew Learning for Kids",
  description: "Interactive Hebrew learning app for children with games, tracing, and fun activities",
  keywords: ["Hebrew", "learning", "kids", "children", "education", "games", "language"],
  authors: [{ name: "Hebrew Learning Team" }],
  openGraph: {
    title: "Hebrew Learning for Kids",
    description: "Interactive Hebrew learning app for children with games, tracing, and fun activities",
    url: "https://hebrew-learning.app",
    siteName: "Hebrew Learning",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hebrew Learning for Kids",
    description: "Interactive Hebrew learning app for children with games, tracing, and fun activities",
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Hebrew Learning',
    'format-detection': 'telephone=no',
  },
};

// Define viewport as a separate export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}