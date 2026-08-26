import { serviceCategoryContentById } from "@/lib/service-categories";

export type ServiceSlug =
  | "pesukone-kuljetus"
  | "sohvan-kuljetus"
  | "sangyn-kuljetus"
  | "apuvalinekuljetus"
  | "kierratys"
  | "muutot";

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
  calculatorCategory: "kappaletavara" | "projekti";
  heroBackgroundImage?: string;
  seasonBanner?: string;
};

export const services: Record<ServiceSlug, ServiceContent> = {
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
  apuvalinekuljetus: {
    slug: "apuvalinekuljetus",
    navLabel: "Apuvälinekuljetus",
    title: "Apuvälinekuljetus",
    description:
      "Pakuvie kuljettaa apuvälineitä – pyörätuolit, rollaattorit, sähkömopot, sairaalasängyt ja nostolaitteet – kotien, hoivakotien ja kotihoidon välillä.",
    valueProposition:
      "Kuljetamme apuvälineet yksityishenkilöille, omaisille, kotihoidolle, hoivakodeille ja vammaispalveluille.",
    includes: [
      "Nouto kotoa, hoivakodista tai varastosta",
      "Varovainen käsittely ja huolellinen suojaus kuljetuksen ajaksi",
      "Toimitus sovittuna aikana perille asti",
      "Pyörätuolit, rollaattorit, sähkömopot, sairaalasängyt ja nostolaitteet",
    ],
    pricingTitle: "Apuvälinekuljetuksen hinnoittelu",
    pricingDescription:
      serviceCategoryContentById.kappaletavara.cardDescription,
    metadataTitle: "Apuvälinekuljetus | Pakuvie",
    metadataDescription:
      "Pakuvie kuljettaa apuvälineet — pyörätuolit, rollaattorit, sähkömopot, sairaalasängyt — turvallisesti Riihimäellä, Hyvinkäällä, Järvenpäässä ja lähialueilla.",
    keywords: [
      "apuvälinekuljetus",
      "pyörätuolin kuljetus",
      "rollaattorin kuljetus",
      "sähkömopon kuljetus",
      "sairaalasängyn kuljetus",
    ],
    calculatorCategory: "kappaletavara",
    heroBackgroundImage: "/images/paku2.png",
  },
  kierratys: {
    slug: "kierratys",
    navLabel: "Kierrätys",
    title: "Kierrätys ja jätteiden poisto — me hoidamme kuljetuksen ja lajittelun",
    description:
      "Täysi vintti, kellari tai varasto? Tuomme, lajittelemme ja viemme tavarasi oikeaan paikkaan — sinä maksat vain jätemaksun suoraan kierrätysasemalle, me hoidamme loput.",
    valueProposition:
      "Helppo tapa päästä eroon ylimääräisestä tavarasta vastuullisesti.",
    includes: [
      "Kodin tyhjennykset ja muuttosiivous tavarat",
      "Vintti-, kellari- ja varastotyhjennykset",
      "Sekajäte, puu, metalli, pahvi ja muu kierrätettävä jäte",
      "Isot ja painavat esineet, jotka eivät mahdu omaan autoon",
    ],
    pricingTitle: "Hinnoittelu",
    pricingDescription:
      "Kierrätyspalvelumme hinta perustuu kuljetukseen ja lajitteluun käytettyyn aikaan sekä matkaan — ei sisällä kierrätysaseman jätemaksua, joka maksetaan aina erikseen suoraan kierrätysasemalle.",
    metadataTitle: "Kierrätys ja jätteiden poisto — Pakuvie",
    metadataDescription:
      "Tuomme, lajittelemme ja kuljetamme jätteesi kierrätysasemalle. Kodin, vintin ja varaston tyhjennykset pääkaupunkiseudulla ja Riihimäen alueella.",
    keywords: [
      "kierrätys",
      "jätteiden poisto",
      "tavaran poisto",
      "vintin tyhjennys",
      "kellarin tyhjennys",
      "varaston tyhjennys",
    ],
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
};

export const serviceNavigationOrder: ServiceSlug[] = [
  "pesukone-kuljetus",
  "sohvan-kuljetus",
  "sangyn-kuljetus",
  "apuvalinekuljetus",
  "kierratys",
  "muutot",
];

export const serviceNavigationLinks = serviceNavigationOrder.map((slug) => ({
  href: `/${slug}`,
  label: services[slug].navLabel,
  slug,
}));

// Moottoripyöräkuljetukset hoitaa sisaryritys MP-Logistiikka, joten linkki
// ohjaa suoraan ulos. Pakuvie ei enää tarjoa palvelua omanaan, mikä poistaa
// samalla sisäisen avainsanakilpailun sivustojen väliltä.
export const MP_LOGISTIIKKA_URL = "https://mp-logistiikka.fi";

export const serviceFooterLinks: Array<{
  href: string;
  label: string;
  external?: boolean;
}> = [
  ...serviceNavigationLinks.map(({ href, label }) => ({ href, label })),
  { href: MP_LOGISTIIKKA_URL, label: "Moottoripyöräkuljetus", external: true },
];

export const quoteServiceOptions = [
  ...serviceNavigationOrder.map((slug) => services[slug].navLabel),
  "Muu kuljetus",
];
