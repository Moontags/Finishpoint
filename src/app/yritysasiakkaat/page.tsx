import type { Metadata } from "next";
import { YritysasiakkaatPage } from "@/components/yritysasiakkaat-page";

const PAGE_URL = "https://www.pakuvie.fi/yritysasiakkaat";

const metadataTitle = "Kuljetuspalvelut yrityksille | Pakuvie";
const metadataDescription =
  "Kuljetuspalvelut yrityksille — yksittäiset kuljetukset ja kuukausisopimukset Riihimäellä, Hyvinkäällä, Järvenpäässä ja lähialueilla. Laske hinta tai kysy tarjous.";

export const metadata: Metadata = {
  title: metadataTitle,
  description: metadataDescription,
  keywords: [
    "yrityskuljetukset",
    "kuljetuspalvelu yrityksille",
    "kuukausisopimus kuljetus",
    "sopimuskuljetus",
    "yritysasiakkaat kuljetus",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: metadataTitle,
    description: metadataDescription,
    url: PAGE_URL,
    images: [
      {
        url: "/images/paku2.png",
        width: 1200,
        height: 630,
        alt: "Pakuvie kuljetuspalvelut yrityksille",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: metadataTitle,
    description: metadataDescription,
  },
};

export default function Page() {
  return <YritysasiakkaatPage />;
}
