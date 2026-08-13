"use client";

import { useEffect, useRef, useState } from "react";

// Yhteiset lomakekentät sivuston julkisille lomakkeille (tarjouspyyntö,
// kierrätyksen tilauslomake), jotta tyylit, osoitehaku ja virheilmoitukset
// pysyvät samanlaisina kaikkialla.
export const inputClass =
  "w-full rounded-xl border border-slate-400 bg-white/30 backdrop-blur-sm px-4 py-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/50 focus:ring-[3px] focus:ring-blue-200";

type AddressSuggestion = {
  label: string;
  placeId: string;
};

export function AddressAutocompleteField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = true,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      const target = event.target as Node | null;
      if (target && !containerRef.current.contains(target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentMouseDown);
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      setSuggestions([]);
      return;
    }

    const query = value.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`, {
          method: "GET",
          signal: controller.signal,
        });

        const result = (await response.json()) as {
          ok: boolean;
          suggestions?: AddressSuggestion[];
        };

        if (!response.ok || !result.ok) {
          setSuggestions([]);
          return;
        }

        setSuggestions(result.suggestions ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [disabled, value]);

  return (
    <label htmlFor={id} className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
      {label}
      <div
        ref={containerRef}
        className="relative max-w-full overflow-x-hidden"
        style={{ touchAction: "pan-y" }}
      >
        <input
          id={id}
          name={name}
          required={required}
          autoComplete="street-address"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onFocus={() => {
            if (!disabled) {
              setIsFocused(true);
            }
          }}
          onChange={(event) => {
            if (!disabled) {
              onChange(event.target.value);
            }
          }}
          className={inputClass}
        />

        {!disabled && isFocused && suggestions.length > 0 ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.placeId || suggestion.label}
                type="button"
                className="block w-full border-b border-slate-200 px-4 py-3 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 last:border-b-0"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(suggestion.label);
                  setSuggestions([]);
                  setIsFocused(false);
                }}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

    </label>
  );
}
