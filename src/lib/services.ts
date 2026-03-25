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
      "Käytä alla olevaa laskuria arvioon. Lopullinen hinta vahvistetaan reitin, aikataulun ja mahdollisten lisäpysähdysten mukaan.",
    metadataTitle: "Moottoripyörän kuljetus | Finishpoint",
    metadataDescription:
      "Nopea ja turvallinen moottoripyörän kuljetus. Pyydä tarjous Finishpointilta.",
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
      "Mönkijät kulkevat turvallisesti perille oikealla kalustolla ja selkeällä aikataululla.",
    includes: [
      "Nouto pihasta, varastosta tai liikkeestä",
      "Varmistettu kiinnitys kuljetuksen ajaksi",
      "Toimitus sovittuun kohteeseen",
      "Mahdollisuus lisäpysähdyksiin samalla reitillä",
    ],
    pricingTitle: "Hinta-arvio mönkijäkuljetukselle",
    pricingDescription:
      "Hinta muodostuu matkan pituudesta, noutoajasta ja kohteen saavutettavuudesta.",
    metadataTitle: "Mönkijän kuljetus | Finishpoint",
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
      "Hinta riippuu kerroksista ja kantomatkasta . Saat arvion nopeasti puhelimella tai lomakkeella.",
    metadataTitle: "Pesukoneen kuljetus | Finishpoint",
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
      "Kuljetamme sohvat koteihin, varastoihin ja liikkeisiin nopeasti sekä varovaisella käsittelyllä.",
    includes: [
      "Nouto yksityiseltä tai liikkeestä",
      "Suojaus ja varovainen kuormaus",
      "Toimitus sovitulle ajalle",
      "Mahdollisuus yhdistää useita kalusteita samaan kuljetukseen",
    ],
    pricingTitle: "Sohvakuljetuksen arvio",
    pricingDescription:
      "Hinta määräytyy koon, kerrosten ja matkan perusteella.",
    metadataTitle: "Sohvan kuljetus | Finishpoint",
    metadataDescription:
      "Sohvan kuljetus turvallisesti ja täsmällisesti. Pyydä tarjous nopeasti Finishpointilta.",
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
      "Siirrämme sängyt ja patjat turvallisesti kotiin, mökille tai varastoon ammattimaisella otteella.",
    includes: [
      "Nouto myymälästä tai yksityiseltä",
      "Huolellinen suojaus kuljetuksen ajaksi",
      "Toimitus sovittuna aikana",
      "Yhteensovitettu kuljetus muun irtaimiston kanssa",
    ],
    pricingTitle: "Sänkykuljetuksen hinnoittelu",
    pricingDescription:
      "Arvio perustuu matkaan, kantotarpeeseen ja aikatauluun. Saat hinnan etukäteen ennen tilausta.",
    metadataTitle: "Sängyn kuljetus | Finishpoint",
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
    description: "Noudamme poistettavat tavarat ja viemme ne asianmukaiseen kierrätykseen.",
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
      "Hinta määräytyy tavaramäärän ja kierrätyspaikan perusteella.",
    metadataTitle: "Kierrätyspalvelu | Finishpoint",
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
    description: "Joustavat muutot koteihin ja pienyrityksille alkaen 295 € (ALV 0 %).",
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
      "Lähtöhinta on 295 € (ALV 0 %). Lopullinen hinta riippuu muuton laajuudesta ja etäisyydestä",
    metadataTitle: "Muuttopalvelu | Finishpoint",
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
    metadataTitle: "Venesiirto | Finishpoint",
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
