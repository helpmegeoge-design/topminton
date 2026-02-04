import React from "react"
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Topminton - แอปนักแบดมินตันไทย",
    template: "%s | Topminton",
  },
  description:
    "แอปสำหรับนักแบดมินตันไทย หาก๊วน หาคอร์ท สุ่มจับคู่ วัดระดับฝีมือ Ranking และอื่นๆ อีกมากมาย",
  keywords: ["แบดมินตัน", "badminton", "หาก๊วน", "หาคอร์ท", "แข่งแบด", "สุ่มจับคู่", "Topminton"],
  authors: [{ name: "Topminton Team" }],
  creator: "Topminton",
  publisher: "Topminton",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/apple-touch-icon.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Topminton",
  },
  metadataBase: new URL("https://www.topminton.com"),
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://www.topminton.com",
    siteName: "Topminton",
    title: "Topminton - แอปนักแบดมินตันไทย",
    description: "แอปสำหรับนักแบดมินตันไทย หาก๊วน หาคอร์ท สุ่มจับคู่ และอื่นๆ",
    images: [
      {
        url: "https://www.topminton.com/og-topminton.jpg",
        width: 1200,
        height: 630,
        alt: "Topminton - แอปนักแบดมินตันไทย",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Topminton - แอปนักแบดมินตันไทย",
    description: "แอปสำหรับนักแบดมินตันไทย หาก๊วน หาคอร์ท สุ่มจับคู่ และอื่นๆ",
    images: ["https://www.topminton.com/og-topminton.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FF9500",
};

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="font-sans antialiased overflow-x-hidden relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light" // Enforce light mode
          disableTransitionOnChange
        >
          {/* Background layers removed as Dark Mode is disabled */}


          <div className="min-h-screen relative z-0 text-foreground">{children}</div>
          <Analytics />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
