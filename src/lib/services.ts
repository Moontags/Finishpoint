import { serviceCategoryContentById } from "@/lib/service-categories";

export type ServiceSlug =
  | "pyorakuljetus"
  | "monkijakuljetus"
  | "pesukone-kuljetus"
  | "sohvan-kuljetus"
  | "sangyn-kuljetus"
  | "kierratys"
  | "muutot"
  | "venesiirto";

export type ServiceContent = {
  slug: ServiceSlug;
  navLabel: string;
  title: string;
  description: string;
  valueProposition: string;
  includes: string[];
  pricingTitle: string;
  pricingDescription: string;
  metadataTitle: string;
  metadataDescription: string;
  keywords: string[];
  calculatorCategory: "ajoneuvo" | "kappaletavara" | "projekti";
  heroBackgroundImage?: string;
  seasonBanner?: string;
};

export const services: Record<ServiceSlug, ServiceContent> = {
  pyorakuljetus: {
    slug: "pyorakuljetus",
    navLabel: "Moottoripyöräkuljetus",
    title: "Moottoripyöräkuljetus",
    description: "Nopea ja turvallinen moottoripyörän kuljetus koko Suomessa.",
    valueProposition:
      "Kuljetamme moottoripyörät huolellisesti sidottuna ja ajallaan  sovittuun osoitteeseen.",
    includes: [
      "Nouto sovitusta osoitteesta",
      "Ammattimainen sidonta ja suojaus",
      "Reaaliaikainen tilannepäivitys puhelimitse",
      "Toimitus sovittuna ajankohtana",
    ],
    pricingTitle: "Hinnoittelu moottoripyörille",
    pricingDescription:
      `${serviceCategoryContentById.ajoneuvo.cardDescription} Lisäpyörän toimitus samaan toimipisteeseen 89 €.`,
    metadataTitle: "Moottoripyörän kuljetus | Pakuvie",
    metadataDescription:
      "Nopea ja turvallinen moottoripyörän kuljetus. Pyydä tarjous Pakuvieilta.",
    keywords: ["moottoripyöräkuljetus", "moottoripyörän kuljetus", "pyörän kuljetus"],
    calculatorCategory: "ajoneuvo",
    heroBackgroundImage: "/images/moottoripyörä.jpeg",
  },
  monkijakuljetus: {
    slug: "monkijakuljetus",
    navLabel: "Mönkijäkuljetus",
    title: "Mönkijäkuljetus",
    description: "Luotettava mönkijän kuljetus mökille, huoltoon tai myyntiin.",
    valueProposition:
      "Mönkijät kulkevat turvallisesti ja aikataulussa perille.",
    includes: [
      "Nouto pihasta, varastosta tai liikkeestä",
      "Varmistettu kiinnitys kuljetuksen ajaksi",
      "Toimitus sovittuun kohteeseen",
      "Mahdollisuus lisäpysähdyksiin samalla reitillä",
    ],
    pricingTitle: "Hinta-arvio mönkijäkuljetukselle",
    pricingDescription:
      serviceCategoryContentById.ajoneuvo.cardDescription,
    metadataTitle: "Mönkijän kuljetus | Pakuvie",
    metadataDescription:
      "Turvallinen mönkijän kuljetus joustavasti koko Suomessa. Pyydä tarjous nopeasti.",
    keywords: ["mönkijäkuljetus", "mönkijän kuljetus", "atv kuljetus"],
    calculatorCategory: "ajoneuvo",
    heroBackgroundImage: "/images/paku1.png",
  },
  "pesukone-kuljetus": {
    slug: "pesukone-kuljetus",
    navLabel: "Pesukoneen kuljetus",
    title: "Pesukoneen kuljetus",
    description: "Pesukoneen nouto ja kuljetus turvallisesti uuteen osoitteeseen.",
    valueProposition:
      "Hoidamme pesukoneen siirron nopeasti ilman, että sinun tarvitsee järjestää kuljetuskalustoa.",
    includes: [
      "Nouto myyjältä tai vanhasta kodista",
      "Kuljetus huolellisella käsittelyllä",
      "Toimitus kotiin tai varastoon",
      "Tarvittaessa vanhan laitteen kierrätys",
    ],
    pricingTitle: "Pesukonekuljetuksen hinnoittelu",
    pricingDescription:
      serviceCategoryContentById.kappaletavara.cardDescription,
    metadataTitle: "Pesukoneen kuljetus | Pakuvie",
    metadataDescription:
      "Pesukoneen kuljetus nopeasti ja turvallisesti. Nouto ja toimitus joustavasti.",
    keywords: ["pesukoneen kuljetus", "kodinkonekuljetus", "pesukone siirto"],
    calculatorCategory: "kappaletavara",
    heroBackgroundImage: "/images/paku1.png",
  },
  "sohvan-kuljetus": {
    slug: "sohvan-kuljetus",
    navLabel: "Sohvan kuljetus",
    title: "Sohvan kuljetus",
    description: "Sohvan nouto ja toimitus vahingoittumatta perille asti.",
    valueProposition:
      "Kuljetamme sohvat liikkeistä, kodeista ja varastoista.",
    includes: [
      "Nouto yksityiseltä tai liikkeestä",
      "Suojaus ja varovainen kuormaus",
      "Toimitus sovitulle ajalle",
      "Mahdollisuus yhdistää useita kalusteita samaan kuljetukseen",
    ],
    pricingTitle: "Sohvakuljetuksen arvio",
    pricingDescription:
      serviceCategoryContentById.kappaletavara.cardDescription,
    metadataTitle: "Sohvan kuljetus | Pakuvie",
    metadataDescription:
      "Sohvan kuljetus turvallisesti ja täsmällisesti. Pyydä tarjous nopeasti Pakuvieilta.",
    keywords: ["sohvan kuljetus", "huonekalukuljetus", "sohvan siirto"],
    calculatorCategory: "kappaletavara",
    heroBackgroundImage: "/images/paku1.png",
  },
  "sangyn-kuljetus": {
    slug: "sangyn-kuljetus",
    navLabel: "Sängyn kuljetus",
    title: "Sängyn kuljetus",
    description: "Sängyn ja runkopaketin kuljetus sujuvasti uuteen kohteeseen.",
    valueProposition:
      "Siirrämme sängyt ja patjat kotiin, mökille tai varastoon.",
    includes: [
      "Nouto myymälästä tai yksityiseltä",
      "Huolellinen suojaus kuljetuksen ajaksi",
      "Toimitus sovittuna aikana",
      "Yhteensovitettu kuljetus muun irtaimiston kanssa",
    ],
    pricingTitle: "Sänkykuljetuksen hinnoittelu",
    pricingDescription:
      serviceCategoryContentById.kappaletavara.cardDescription,
    metadataTitle: "Sängyn kuljetus | Pakuvie",
    metadataDescription:
      "Sängyn kuljetus nopeasti ja turvallisesti. Nouto ja toimitus sovitusti.",
    keywords: ["sängyn kuljetus", "patjan kuljetus", "huonekalujen kuljetus"],
    calculatorCategory: "kappaletavara",
    heroBackgroundImage: "/images/paku1.png",
  },
  kierratys: {
    slug: "kierratys",
    navLabel: "Kierrätys",
    title: "Kierrätyspalvelu",
    description: "Kierrätyspalvelu alkaen 54,99 € sis. ALV. Aloitushintaan sisältyy 40 km.",
    valueProposition:
      "Helppo tapa päästä eroon ylimääräisestä tavarasta vastuullisesti.",
    includes: [
      "Nouto kotiovelta tai varastosta",
      "Lajittelu ja kuljetus kierrätyspisteisiin",
      "Huonekalujen ja kodinkoneiden poistot",
      "Selkeä hinnoittelu etukäteen",
    ],
    pricingTitle: "Kierrätyksen hinta-arvio",
    pricingDescription:
      serviceCategoryContentById.projekti.cardDescription,
    metadataTitle: "Kierrätyspalvelu | Pakuvie",
    metadataDescription:
      "Kierrätyspalvelu ja tavaran poistot nopeasti. Nouto ja vastuullinen käsittely.",
    keywords: ["kierrätys", "tavaran poisto", "kodinkoneiden kierrätys"],
    calculatorCategory: "projekti",
    heroBackgroundImage: "/images/paku1.png",
  },
  muutot: {
    slug: "muutot",
    navLabel: "Muutot",
    title: "Muuttopalvelut",
    description: "Joustavat muutot koteihin ja pienyrityksille alkaen 269 € sis. ALV. Aloitushintaan sisältyy 40 km.",
    valueProposition:
      "Sinä keskityt uuteen kotiin – me hoidamme muuton.",
    includes: [
      "Nouto vanhasta osoitteesta",
      "Kalusteiden ja laatikoiden kuljetus",
      "Toimitus uuteen osoitteeseen",
      "Mahdollisuus lisäajoihin ja väliosoitteisiin",
    ],
    pricingTitle: "Muuttojen hinnoittelu",
    pricingDescription:
      serviceCategoryContentById.projekti.cardDescription,
    metadataTitle: "Muuttopalvelu | Pakuvie",
    metadataDescription:
      "Muuttopalvelut koteihin ja pienyrityksille. Selkeä hinnoittelu ja luotettava toteutus.",
    keywords: ["muuttopalvelu", "muutto", "muuttokuljetus"],
    calculatorCategory: "projekti",
    heroBackgroundImage: "/images/paku3.png",
  },
  venesiirto: {
    slug: "venesiirto",
    navLabel: "Venesiirto",
    title: "Venesiirto",
    description: "Kausiluonteinen venesiirto turvallisesti satamasta toiseen.",
    valueProposition:
      "Kuljetamme veneet suunnitellusti kevään ja syksyn ruuhkahuippuina oikealla kalustolla.",
    includes: [
      "Nouto satamasta tai telakalta",
      "Kuljetus sovitun reitin mukaan",
      "Toimitus kohdesatamaan tai varastointiin",
      "Aikataulutus sesongin mukaan",
    ],
    pricingTitle: "Venesiirron hinta-arvio",
    pricingDescription:
      "Hinta määräytyy veneen koon, reitin sekä nosto- ja laskujärjestelyjen perusteella. Kysy arvio kauden aikataulun mukaan.",
    metadataTitle: "Venesiirto | Pakuvie",
    metadataDescription:
      "Venesiirrot sesonkiaikaan turvallisesti ja luotettavasti. Pyydä tarjous venekuljetukselle.",
    keywords: ["venesiirto", "venekuljetus", "veneiden kuljetus"],
    calculatorCategory: "ajoneuvo",
    heroBackgroundImage: "/images/paku1.png",
    seasonBanner: "Kausi käynnissä",
  },
};

export const serviceNavigationOrder: ServiceSlug[] = [
  "pyorakuljetus",
  "monkijakuljetus",
  "pesukone-kuljetus",
  "sohvan-kuljetus",
  "sangyn-kuljetus",
  "kierratys",
  "muutot",
];

export const serviceNavigationLinks = serviceNavigationOrder.map((slug) => ({
  href: `/${slug}`,
  label: services[slug].navLabel,
  slug,
}));

export const serviceFooterLinks = [
  {
    href: "/laskuri/projekti",
    label: serviceCategoryContentById.projekti.label,
  },
  ...serviceNavigationLinks.filter(({ slug }) => slug !== "muutot" && slug !== "kierratys").map(({ href, label }) => ({
    href,
    label,
  })),
];

export const quoteServiceOptions = [
  ...serviceNavigationOrder.map((slug) => services[slug].navLabel),
  "Muu kuljetus",
];
