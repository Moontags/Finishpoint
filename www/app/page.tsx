import Image from 'next/image';
import { ContactForm } from './contact-form';
const services = [
  ['01', 'Pölyt pois. Pinnat puhtaiksi.', 'Käytämme paineilmaa pölyn irrottamiseen puhdistukseen soveltuvista kohteista. Viimeistelemme työn huolellisella imuroinnilla sekä lattian, hallintalaitteiden ja sisäpintojen puhdistuksella.'],
  ['02', 'Raikkautta penkkiin asti.', 'Penkkien ja tekstiiliverhoilujen pesu materiaalin mukaan. Pinttyneen lian käsittely ja viimeistely kuuluvat perusteelliseen sisäpesuun.'],
  ['03', 'Myös hajuille lähtöpassit.', 'Hajun lähde selvitetään ja puhdistetaan ensin. Mahdollinen erillinen hajunpoistokäsittely ja sen soveltuvuus arvioidaan konekohtaisesti.'],
];
export default function Home() {
  return <>
    <a className="skip" href="#sisalto">Siirry sisältöön</a>
    <div className="preview">ENSIMMÄINEN LUONNOS <span>Brändinimi ja hinnat ovat alustavia.</span></div>
    <header className="header wrap">
      <a href="#" className="brand" aria-label="Hyttihuolto, etusivu"><span className="brand-mark">H<span>↗</span></span>HYTTIHUOLTO<span className="brand-dot">.</span></a>
      <nav aria-label="Päävalikko"><a href="#palvelut">Palvelut</a><a href="#hinnasto">Hinnasto</a><a href="#toiminta-alue">Toiminta-alue</a></nav>
      <a className="button small" href="#yhteys">Pyydä tarjous <span>↗</span></a>
    </header>
    <main id="sisalto">
      <section className="hero wrap">
        <div className="hero-content"><p className="eyebrow"><span className="status-dot"/> LIIKKUVA TYÖKONEIDEN SISÄPESU</p>
          <h1>Kova työ.<br/>Puhdas <span>hytti.</span></h1>
          <p className="hero-description">Työpäivä jättää jälkensä. Me puhdistamme ne.<br/>Tulemme koneesi luo ja laitamme hytin kuntoon — työmaalla, hallilla tai tilallasi.</p>
          <div className="hero-actions"><a className="button" href="#yhteys">Pyydä tarjous <span>↗</span></a><a className="text-link" href="#hinnasto">Tutustu hintoihin <span>↓</span></a></div>
          <div className="hero-note"><span>↗</span> Kone pysyy paikallaan. Me liikumme.</div>
        </div>
        <div className="hero-photo"><Image src="/images/excavator.jpg" alt="Kuvituskuva: keltainen kaivinkone työmaalla" fill priority sizes="(max-width: 760px) 100vw, 55vw"/><div className="photo-shade"/><div className="photo-card"><span className="spark">✳</span><div>Puhdas työympäristö.<br/><strong>Sinun koneessasi.</strong></div></div></div>
      </section>
      <div className="machine-strip"><ul className="wrap" aria-label="Puhdistettavat konetyypit"><li>Kaivinkoneet</li><li>Traktorit</li><li>Metsäkoneet</li><li>Muu työkalusto</li></ul></div>
      <section id="palvelut" className="section wrap"><div className="section-heading"><p className="eyebrow">01 / PALVELUT</p><h2>Hytti on työpaikkasi.<br/><span>Pidetään siitä huolta.</span></h2><p>Pöly, kura ja pitkät työpäivät näkyvät hytissä. Huolellinen sisäpesu tuo viihtyisyyttä sinne, missä vietät suuren osan päivästäsi.</p></div>
        <div className="services">{services.map(([number,title,description])=><article className="service" key={number}><span className="service-number">{number} /</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>
      <section className="onsite wrap"><div className="onsite-photo"><Image src="/images/tractor.jpg" alt="Kuvituskuva: traktori pellolla" fill sizes="(max-width: 760px) 100vw, 45vw"/></div><div className="onsite-content"><p className="eyebrow">PALVELU TULEE SINUN LUOKSESI</p><h2>Ei siirtoajoa.<br/>Ei ylimääräistä säätöä.</h2><p>Käytämme paineilmaa hytin puhdistuksessa. Puhdistusvälineet ja paineilmalaitteisto kulkevat mukanamme koneesi luo. Sovitaan paikka ja ajankohta koneesi työrytmin mukaan.</p><ol><li><span>01</span><div><strong>Kerro koneesta ja sijainnista</strong><p>Koneen tyyppi, puhdistustarve ja paikkakunta riittävät alkuun.</p></div></li><li><span>02</span><div><strong>Sovitaan työ ja hinta</strong><p>Vahvistamme sisällön, matkakulut ja tarvittavat työskentelyolosuhteet etukäteen.</p></div></li><li><span>03</span><div><strong>Me tulemme, hytti puhdistuu</strong><p>Sovimme myös tekstiilien kuivumisesta ennen koneen seuraavaa käyttöä.</p></div></li></ol></div></section>
      <section id="hinnasto" className="section wrap"><div className="section-heading"><p className="eyebrow">02 / HINNASTO</p><h2>Sopiva pesu.<br/><span>Selkeä hinta.</span></h2><p>Alla alustavat hinnoitteluehdotukset. Lopullinen tarjous määräytyy hytin koon, likaisuuden ja työn laajuuden mukaan.</p></div><div className="prices">
        <article className="price-card"><p className="eyebrow">SÄÄNNÖLLISEEN PUHDISTUKSEEN</p><h3>Ylläpitopesu</h3><p className="price">149 € <span>/ kone, alv 0 %</span></p><p>Alustava lähtöhinta</p><ul><li>Pölyn poisto ja imurointi</li><li>Sisäpintojen pyyhintä</li><li>Lattian ja mattojen puhdistus</li><li>Sisälasien puhdistus</li></ul><a className="button outline" href="#yhteys">Kysy ylläpitopesusta <span>↗</span></a></article>
        <article className="price-card featured"><span className="card-badge">PERUSTEELLINEN PUHDISTUS</span><p className="eyebrow">KUN HYTTI KAIPAA ENEMMÄN</p><h3>Sisäpesu</h3><p className="price">249 € <span>/ kone, alv 0 %</span></p><p>Alustava lähtöhinta</p><ul><li>Kaikki ylläpitopesun työvaiheet</li><li>Penkin ja verhoilujen pesu</li><li>Pinttyneen lian käsittely</li><li>Sisäpintojen huolellinen viimeistely</li></ul><a className="button" href="#yhteys">Kysy sisäpesusta <span>↗</span></a></article>
        <article className="price-card"><p className="eyebrow">USEAMPI KONE TAI ERIKOISTYÖ</p><h3>Kalustopesu</h3><p className="custom-price">Hinta tarjouksen mukaan</p><p>Kalustosi ja tarpeesi mukaan</p><ul><li>Useampi kone samassa kohteessa</li><li>Säännölliset puhdistuskäynnit</li><li>Erityisen likaiset hytit</li><li>Hajunpoisto erikseen sovittaessa</li></ul><a className="button outline" href="#yhteys">Kerro kalustostasi <span>↗</span></a></article>
      </div><p className="price-note">Luonnoshinnasto yritysasiakkaille, ei vielä voimassa. Arvonlisävero ja mahdolliset matkakulut eritellään vahvistettavassa tarjouksessa. Hajunpoistokäsittely ei sisälly yllä oleviin hintoihin.</p></section>
      <section id="toiminta-alue" className="area"><div className="wrap area-inner"><div><p className="eyebrow">03 / TOIMINTA-ALUE</p><h2>Sinne, missä<br/><span>koneesi on.</span></h2></div><div><p className="area-lead">Tuusulasta koko Suomeen.</p><p>Kotipaikkamme on Tuusula. Palvelemme Uudellamaalla ja koko Suomessa. Käynnit ja matkakulut sovitaan tapauskohtaisesti.</p><a href="#yhteys" className="text-link">Kysy käyntiä omalle työmaallesi <span>↗</span></a></div><span className="area-star" aria-hidden="true">✳</span></div></section>
      <section id="yhteys" className="section contact wrap"><div><p className="eyebrow">04 / OTA YHTEYTTÄ</p><h2>Seuraava työpäivä.<br/><span>Puhtaammasta hytistä.</span></h2><p>Kerro millainen kone kaipaa puhdistusta ja missä se sijaitsee. Sovitaan siihen sopiva palvelu.</p><div className="contact-note"><span>↗</span><p>Yksi kone tai koko kalusto.<br/><strong>Aloitetaan sinun tarpeestasi.</strong></p></div></div><ContactForm/></section>
      <section className="faq wrap"><h2>Hyvä tietää ennen pesua</h2>{[['Mitä pesupaikalla tarvitaan?', 'Koneen ympärille tarvitaan turvallinen työskentelytila. Sähkön, veden ja muiden olosuhteiden tarve vahvistetaan tarjouksen yhteydessä valittujen menetelmien mukaan.'],['Voiko konetta käyttää heti pesun jälkeen?', 'Pintojen puhdistuksen jälkeen käyttö onnistuu sovitusti. Tekstiilipesu edellyttää kuivumisaikaa, joka riippuu materiaalista ja olosuhteista. Sovimme aikataulun etukäteen.'],['Sisältyykö hajunpoisto sisäpesuun?', 'Erillinen hajunpoistokäsittely sovitaan ja hinnoitellaan erikseen. Menetelmä, soveltuvuus ja mahdollinen käyttökatko arvioidaan kohteen mukaan.']].map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</section>
    </main><p className="photo-credit wrap">Sivun kuvat ovat Unsplash-kuvituskuvia, eivät yrityksen kalustosta tai asiakastöistä.</p><footer className="footer wrap"><a href="#" className="brand">HYTTIHUOLTO.</a><p>Puhtaampi hytti. Parempi työpäivä.</p><span>© {new Date().getFullYear()} Hyttihuolto · Sivustoluonnos</span></footer>
  </>;
}
