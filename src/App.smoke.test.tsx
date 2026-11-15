// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { useAura } from "./store/useAura";

// jsdom'da olmayan tarayıcı API'leri
window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as never;
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as never;

// Ağ yok: Wikipedia isteği başarısız olsa da Motivasyon sekmesi çalışmalı
globalThis.fetch = (() => Promise.reject(new Error("offline"))) as never;

describe("uygulama duman testi", () => {
  it("açılır, tüm görünümleri ve kılavuzu donmadan render eder", async () => {
    vi.useRealTimers();
    const { container, findByText } = render(<App />);
    await findByText("Günlük", undefined, { timeout: 4000 });
    for (const v of ["weight", "analytics", "motivation", "today"] as const) {
      await act(async () => useAura.getState().setView(v));
    }
    await act(async () => useAura.getState().setGuideOpen(true));
    expect(container.textContent).toContain("Hoş geldin");
    await act(async () => useAura.getState().toggleTheme());
    expect(document.documentElement.dataset.theme).toBeUndefined();
  }, 15000);
});
