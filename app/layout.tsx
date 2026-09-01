import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://scenemint.danielodeyemi27.chatgpt.site"),
  title: "STITCH — Habitat Corridor Digital Twin",
  description:
    "Find a feasible wildlife corridor, then stress-test the intervention in a transparent ecological digital twin before restoration money is spent.",
  keywords: [
    "habitat connectivity",
    "wildlife corridor",
    "conservation technology",
    "Attwater's prairie-chicken",
    "ecological model",
  ],
  openGraph: {
    title: "STITCH — Reconnect the last one percent",
    description:
      "A transparent habitat-corridor optimizer and 20-year ecological stress test for conservation decisions.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1672,
        height: 941,
        alt: "STITCH reconnects fragmented prairie habitat with a visible orange lifeline.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "STITCH — Habitat Corridor Digital Twin",
    description:
      "Find the least-cost habitat corridor. Test whether it meaningfully changes survival.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  other: {
    "codex-preview": "development",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
