import type { Metadata } from "next";
import { KierratysPage } from "@/components/kierratys-page";
import { services } from "@/lib/services";

const service = services.kierratys;

export const metadata: Metadata = {
  title: service.metadataTitle,
  description: service.metadataDescription,
  keywords: service.keywords,
};

export default function Page() {
  return <KierratysPage />;
}
