import type { Metadata } from "next";
import { ServicePage } from "@/components/service-page";
import { services } from "@/lib/services";

const service = services["apuvalinekuljetus"];

export const metadata: Metadata = {
  title: service.metadataTitle,
  description: service.metadataDescription,
  keywords: service.keywords,
  alternates: { canonical: "https://www.pakuvie.fi/apuvalinekuljetus" },
  openGraph: {
    title: service.metadataTitle,
    description: service.metadataDescription,
    url: "https://www.pakuvie.fi/apuvalinekuljetus",
    images: [
      {
        url: "/images/paku2.png",
        width: 1200,
        height: 630,
        alt: "Pakuvie apuvälinekuljetus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: service.metadataTitle,
    description: service.metadataDescription,
  },
};

export default function ApuvalineKuljetusPage() {
  return <ServicePage service={service} />;
}
