export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#252525] text-zinc-100 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
