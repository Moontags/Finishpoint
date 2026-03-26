import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finishpoint | Kuljetukset ja muutot",
  description:
    "Finishpoint tarjoaa tavarakuljetukset, muutot & siirtopalvelut yhdestä paikasta",
  applicationName: "Finishpoint",
  keywords: [
    "kuljetuspalvelu",
    "tavarakuljetus",
    "muuttopalvelu",
    "moottoripyöräkuljetus",
    "kierrätys",
  ],
  openGraph: {
    type: "website",
    locale: "fi_FI",
    title: "Finishpoint | Kuljetukset ja muutot",
    description:
      "Finishpoint tarjoaa tavarakuljetukset, muutot & siirtopalvelut yhdestä paikasta",
    siteName: "Finishpoint",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finishpoint | Kuljetukset ja muutot",
    description:
      "Finishpoint tarjoaa tavarakuljetukset, muutot & siirtopalvelut yhdestä paikasta",
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