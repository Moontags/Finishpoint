export function ServiceList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2.5 text-[14px] text-slate-700 sm:text-[15px]">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
