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
};
  
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <body className={`${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}