"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 2000 }: ToastProps) {
  useEffect(() => {
    if (type === "success") {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [type, duration, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 18px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        background: type === "success" ? "#16a34a" : "#dc2626",
        color: "#fff",
        minWidth: "220px",
        maxWidth: "360px",
        animation: "slideIn 0.2s ease",
      }}
    >
      <span style={{ fontSize: "16px" }}>{type === "success" ? "✓" : "✕"}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
          fontSize: "18px",
          lineHeight: 1,
          padding: "0 0 0 8px",
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const showToast = (message: string, type: ToastType) => setToast({ message, type });
  const hideToast = () => setToast(null);
  return { toast, showToast, hideToast };
}
