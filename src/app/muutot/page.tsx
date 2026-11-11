import type { Metadata } from "next";
import { ServicePage } from "@/components/service-page";
import { services } from "@/lib/services";

import { APUMIES, apumiesPriceSummary, apumiesPriceTerms } from "@/lib/pricing";

const service = services.muutot;

export const metadata: Metadata = {
  title: service.metadataTitle,
  description: service.metadataDescription,
  keywords: service.keywords,
};

export default function MuutotPage() {
  const description = `${apumiesPriceSummary()}. ${apumiesPriceTerms()}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Apumies ja kantoapu kuljetuksen yhteydessä",
        url: "https://pakuvie.fi/muutot#apumies",
        description,
        offers: {
          "@type": "Offer",
          price: APUMIES.minimumPrice,
          priceCurrency: "EUR",
          description,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: APUMIES.minimumPrice,
            priceCurrency: "EUR",
            valueAddedTaxIncluded: true,
            referenceQuantity: { "@type": "QuantitativeValue", value: APUMIES.minimumHours, unitCode: "HUR" },
          },
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [{
          "@type": "Question",
          name: "Mitä apumies maksaa?",
          acceptedAnswer: { "@type": "Answer", text: description },
        }],
      },
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <ServicePage service={service} />
  </>;
}
