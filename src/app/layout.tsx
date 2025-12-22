import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Rethink Self Storage Fund | EOM Dashboard",
  description:
    "End-of-month performance dashboard for Rethink Self Storage Fund - view revenue, occupancy, NOI metrics, and operational insights across Charlotte and Houston markets.",
  keywords: [
    "self storage",
    "investment dashboard",
    "real estate",
    "fund performance",
    "EOM report",
  ],
  authors: [{ name: "Rethink Asset Management" }],
  openGraph: {
    title: "Rethink Self Storage Fund | EOM Dashboard",
    description:
      "End-of-month performance dashboard for Rethink Self Storage Fund",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f766e" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
