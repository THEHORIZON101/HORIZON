import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://archemidy.danielodeyemi27.chatgpt.site"),
  title: "Archemidy — Symbolic Consequence Engine",
  description: "Calculate what rules will do before they affect people or software.",
  openGraph: {
    title: "Archemidy — Symbolic Consequence Engine",
    description: "Calculate what rules will do before they affect people or software.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Archemidy symbolic consequence engine" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Archemidy — Symbolic Consequence Engine",
    description: "Calculate what rules will do before they affect people or software.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
