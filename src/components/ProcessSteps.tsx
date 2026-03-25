const defaultSteps = [
  {
    title: "1. Pyyntö",
    description: "Jätä tarjouspyyntö puhelimella tai lomakkeella.",
  },
  {
    title: "2. Kuljetus",
    description: "Noudamme kuorman sovitusti ja kuljetamme turvallisesti.",
  },
  {
    title: "3. Toimitus",
    description: "Toimitamme kohteeseen ajallaan ja vahvistamme toimituksen.",
  },
];

export function ProcessSteps({
  steps = defaultSteps,
}: {
  steps?: Array<{ title: string; description: string }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step) => (
        <article
          key={step.title}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-[15px] font-bold text-slate-900">{step.title}</h3>
          <p className="mt-2 text-[14px] leading-6 text-slate-500">{step.description}</p>
        </article>
      ))}
    </div>
  );
}
