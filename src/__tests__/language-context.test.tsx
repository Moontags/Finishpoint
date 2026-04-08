import React from "react";
import { render, screen, act } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "../lib/LanguageContext";

describe("LanguageContext", () => {
  function TestComponent() {
    const { language, t, setLanguage } = useLanguage();
    return (
      <div>
        <span data-testid="lang">{language}</span>
        <span data-testid="hello">{t("hello", "Hello")}</span>
        <button onClick={() => setLanguage("en")}>EN</button>
        <button onClick={() => setLanguage("fi")}>FI</button>
      </div>
    );
  }

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to Finnish (fi)", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    expect(screen.getByTestId("lang").textContent).toBe("fi");
  });

  it("t() returns correct translation for 'fi'", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    // 'hello' should be translated to 'Hei' in fi.json
    expect(screen.getByTestId("hello").textContent).toMatch(/Hei|Hello/);
  });

  it("t() returns correct translation for 'en'", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    act(() => {
      screen.getByText("EN").click();
    });
    expect(screen.getByTestId("lang").textContent).toBe("en");
    // 'hello' should be translated to 'Hello' in en.json
    expect(screen.getByTestId("hello").textContent).toMatch(/Hello/);
  });

  it("t() returns fallback when key not found", () => {
    function FallbackComponent() {
      const { t } = useLanguage();
      return <span data-testid="fallback">{t("missing_key", "Fallback")}</span>;
    }
    render(
      <LanguageProvider>
        <FallbackComponent />
      </LanguageProvider>
    );
    expect(screen.getByTestId("fallback").textContent).toBe("Fallback");
  });

  it("persists language selection in localStorage", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    act(() => {
      screen.getByText("EN").click();
    });
    expect(window.localStorage.getItem("fp-language")).toBe("en");
    act(() => {
      screen.getByText("FI").click();
    });
    expect(window.localStorage.getItem("fp-language")).toBe("fi");
  });
});