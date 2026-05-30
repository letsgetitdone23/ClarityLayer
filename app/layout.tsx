import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../hooks/useTheme";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Claude — Clarity Layer",
  description: "A structured transparency system that surfaces sentence-level confidence flags and assumption transparency on AI responses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
