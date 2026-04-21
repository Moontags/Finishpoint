import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { LanguageProvider } from "@/lib/LanguageContext";

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
  title: "Pakuvie | Kuljetukset ja muutot",
  description: "Pakuvie hoitaa kuljetukset puolestasi. Paku- ja tavarakuljetukset, muutot ja kierrätys Riihimäellä, Hyvinkäällä, Järvenpäässä ja lähialueilla.",
  applicationName: "Pakuvie",
  keywords: [
    "kuljetuspalvelu",
    "tavarakuljetus",
    "muuttopalvelu",
    "moottoripyöräkuljetus",
    "kierrätys",
  ],
  metadataBase: new URL("https://www.pakuvie.fi"),
  openGraph: {
    type: "website",
    locale: "fi_FI",
    url: "https://www.pakuvie.fi",
    title: "Pakuvie | Kuljetukset ja muutot",
    description: "Pakuvie hoitaa kuljetukset puolestasi. Paku- ja tavarakuljetukset, muutot ja kierrätys Riihimäellä, Hyvinkäällä, Järvenpäässä ja lähialueilla.",
    siteName: "Pakuvie",
    images: [
      {
        url: "/images/paku2.png",
        width: 1200,
        height: 630,
        alt: "Pakuvie kuljetuspalvelu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pakuvie | Kuljetukset ja muutot",
    // description removed
  },
  robots: {
    index: true,
    follow: true,
  },
};
  
const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" data-scroll-behavior="smooth">
      <body className={`${montserrat.variable} antialiased`}>
        <LanguageProvider>
          {children}
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}