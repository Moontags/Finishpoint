"use client";
import { useEffect, useRef } from "react";

export function Modal({ open, onClose, children }: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (overlayRef.current && e.target === overlayRef.current) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {children}
        <button
          type="button"
          aria-label="Sulje"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
          onClick={onClose}
        >
          <span aria-hidden>×</span>
        </button>
      </div>
    </div>
  );
}
