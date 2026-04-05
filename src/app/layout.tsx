import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Finishpoint | Kuljetukset ja muutot",
  // description removed
  applicationName: "Finishpoint",
  keywords: [
    "kuljetuspalvelu",
    "tavarakuljetus",
    "muuttopalvelu",
    "moottoripyöräkuljetus",
    "kierrätys",
  ],
  metadataBase: new URL("https://www.finishpoint.fi"),
  openGraph: {
    type: "website",
    locale: "fi_FI",
    url: "https://www.finishpoint.fi",
    title: "Finishpoint | Kuljetukset ja muutot",
    // description removed
    siteName: "Finishpoint",
    images: [
      {
        url: "/images/paku2.png",
        width: 1200,
        height: 630,
        alt: "Finishpoint kuljetuspalvelu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finishpoint | Kuljetukset ja muutot",
    // description removed
  },
  robots: {
    index: true,
    follow: true,
  },
};
  
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" data-scroll-behavior="smooth">
      <body className={`${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}