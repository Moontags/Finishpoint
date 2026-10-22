import type { Metadata } from 'next';
import { Barlow_Condensed, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-heading', display: 'swap' });
export const metadata: Metadata = {
  title: 'Hyttihuolto — Puhdas hytti. Parempi työpäivä.',
  description: 'Liikkuva työkoneiden sisäpesu ja hyttien puhdistus. Kaivinkoneet, traktorit ja metsäkoneet työmaalla, hallilla tai tilallasi.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fi" className={`${inter.variable} ${barlow.variable}`}><body>{children}</body></html>;
}
