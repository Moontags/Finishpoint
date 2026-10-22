import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Hyttihuolto — Puhdas hytti. Parempi työpäivä.',
  description: 'Liikkuva työkoneiden sisäpesu ja hyttien puhdistus. Kaivinkoneet, traktorit ja metsäkoneet työmaalla, hallilla tai tilallasi.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fi"><body>{children}</body></html>;
}
