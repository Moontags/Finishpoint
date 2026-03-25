import type { Metadata } from "next";
import { ServicePage } from "@/components/service-page";
import { services } from "@/lib/services";

const service = services.kierratys;

export const metadata: Metadata = {
  title: service.metadataTitle,
  description: service.metadataDescription,
  keywords: service.keywords,
};

export default function KierratysPage() {
  return <ServicePage service={service} />;
}
