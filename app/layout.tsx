import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal House — n8n Mastery Field Manual",
  description: "A private field manual for mastering n8n through high-value automation projects.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
