import type { ServiceCategory } from "@/lib/types";

export type ServiceCategoryContent = {
  id: ServiceCategory;
  label: string;
  cardTitle: string;
  cardDescription: string;
  cardAccent: string;
  href: string;
  backgroundImage: string;
  featured?: boolean;
};

export const serviceCategories: ServiceCategoryContent[] = [
  {
    id: "kappaletavara",
    label: "Kappaletavara",
    cardTitle: "Kappaletavarakuljetukset",
    cardDescription:
      "Pesukone, sohva ja sänky. 0-40 km 59 €, yli 40 km +1,29 €/km.",
    cardAccent: "Alkaen 59 €",
    href: "/pesukone-kuljetus",
    backgroundImage: "/images/paku1.png",
  },
  {
    id: "projekti",
    label: "Muutto",
    cardTitle: "Muuttopalvelut",
    cardDescription:
      "Muutot alkaen 269 €.",
    cardAccent: "Muutot",
    href: "/muutot",
    backgroundImage: "/images/paku3.png",
  },
];

export const serviceCategoryContentById = Object.fromEntries(
  serviceCategories.map((category) => [category.id, category]),
) as Record<ServiceCategory, ServiceCategoryContent>;