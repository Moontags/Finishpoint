import { useLanguage } from "@/lib/LanguageContext";

const defaultSteps = [
  {
    title: "1. Pyyntö",
    description: undefined,
  },
  {
    title: "2. Kuljetus",
    description: undefined,
  },
  {
    title: "3. Toimitus",
    description: undefined,
  },
];

export function ProcessSteps({
  steps = defaultSteps,
}: {
  steps?: Array<{ title: string; description?: string }>;
}) {
  const { t } = useLanguage();
  const stepDescriptions = [
    t('steps.step1', 'Jätä tarjouspyyntö puhelimella tai lomakkeella.'),
    t('steps.step2', 'Noudamme kuorman sovitusti ja kuljetamme turvallisesti.'),
    t('steps.step3', 'Toimitamme kohteeseen ajallaan ja vahvistamme toimituksen.'),
  ];
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step, i) => (
        <article
          key={step.title}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-[15px] font-bold text-slate-900">{step.title}</h3>
          <p className="mt-2 text-[14px] leading-6 text-slate-600">{step.description || stepDescriptions[i]}</p>
        </article>
      ))}
    </div>
  );
}
