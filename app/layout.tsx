import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";

import "@/styles/globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree"
});

export const metadata: Metadata = {
  title: "Capital Life",
  description: "Premium Investor App fuer Capital Life"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${figtree.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
