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
      "Pesukone, sohva ja sänky. 0-40 km 89 €, yli 40 km +1,29 €/km. Kerroslisä ilman hissiä 5 €/kerros.",
    cardAccent: "Alkaen 89 €",
    href: "/pesukone-kuljetus",
    backgroundImage: "/images/paku1.png",
  },
  {
    id: "projekti",
    label: "Muutot ja kierrätys",
    cardTitle: "Muuttopalvelut ja kierrätys",
    cardDescription:
      "Muutot alkaen 269 € ja kierrätys alkaen 54,99 €. Aloitushintaan sisältyy 40 km, jonka jälkeen lisäkilometrit 0,69 €/km.",
    cardAccent: "Muutot ja poistot",
    href: "/muutot",
    backgroundImage: "/images/paku3.png",
  },
  {
    id: "ajoneuvo",
    label: "Ajoneuvokuljetukset",
    cardTitle: "Ajoneuvokuljetukset",
    cardDescription:
      "Moottoripyörät, mönkijät, ruohonleikkurit ja mopot. 0-40 km 129 €, 41-80 km 169 €, sen jälkeen 1,29 €/km.",
    cardAccent: "Siirtopalvelu",
    href: "/pyorakuljetus",
    backgroundImage: "/images/moottoripyörä.jpeg",
    featured: true,
  },
];

export const serviceCategoryContentById = Object.fromEntries(
  serviceCategories.map((category) => [category.id, category]),
) as Record<ServiceCategory, ServiceCategoryContent>;