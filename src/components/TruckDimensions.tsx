const dimensions = [
  { label: "Pituus", value: "3,30 m", icon: "↔" },
  { label: "Leveys", value: "1,55 m", icon: "↕" },
  { label: "Korkeus", value: "1,90 m", icon: "↨" },
  { label: "Tilavuus", value: "9,71 m³", icon: "□" },
];

export default function TruckDimensions() {
  return (
    <div className="w-full py-4 px-2 sm:mt-36">
      <p className="text-center text-[11px] text-gray-500 uppercase tracking-widest mb-2">
        Tavaratilan mitat
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 max-w-md mx-auto">
        {dimensions.map((d) => (
          <div
            key={d.label}
            className="flex flex-col items-center justify-center bg-transparent border border-gray-200/60 rounded-lg py-2 px-1"
          >
            <span className="text-base text-gray-400 mb-0.5">{d.icon}</span>
            <span className="text-sm font-bold text-gray-900">{d.value}</span>
            <span className="text-[10px] text-gray-500 mt-0.5">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
