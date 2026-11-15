import { describe, expect, it } from "vitest";
import { addDays } from "./date";
import { deficitReport, evaluate, streak, weeklyAverages, weightSeries } from "./engine";
import { defaultSettings, emptyDay, type AppData } from "./types";

const START = "2026-10-01";

const mk = (kcalByDay: Record<string, number | { kcal: number; cheat?: boolean; weight?: number; trained?: boolean }>): AppData => {
  const days: AppData["days"] = {};
  for (const [date, v] of Object.entries(kcalByDay)) {
    const o = typeof v === "number" ? { kcal: v } : v;
    days[date] = {
      ...emptyDay(),
      trained: !!o.trained,
      weight: o.weight,
      entries: o.kcal ? [{ uid: date, name: "x", kcal: o.kcal, protein: 10, qty: 1, category: "aksam", at: 0, cheat: o.cheat }] : [],
    };
  }
  return { version: 1, days, customFoods: [], customDb: [], settings: defaultSettings(START) };
};

const d = (n: number) => addDays(START, n);

describe("Kural 1 — esnek diyet", () => {
  it("2000-2200 bandı başarılı, altı/üstü doğru sınıflanır", () => {
    const ev = evaluate(mk({ [d(0)]: 2150, [d(1)]: 1800, [d(2)]: 2500 }), d(3));
    expect(ev.get(d(0))!.status).toBe("success");
    expect(ev.get(d(1))!.status).toBe("under");
    expect(ev.get(d(2))!.status).toBe("over");
    expect(ev.get(d(3))!.status).toBe("open");
  });
});

describe("Kural 2 — telafi protokolü", () => {
  it("3100+ sonraki 2 günü 1500-1600 bandına çeker, sonra normale döner", () => {
    const ev = evaluate(mk({ [d(0)]: 3200, [d(1)]: 1550, [d(2)]: 1580, [d(3)]: 2100 }), d(3));
    expect(ev.get(d(0))!.status).toBe("trigger");
    expect(ev.get(d(1))!.mode).toBe("telafi");
    expect(ev.get(d(1))!.compIndex).toBe(1);
    expect(ev.get(d(1))!.status).toBe("success");
    expect(ev.get(d(2))!.compIndex).toBe(2);
    expect(ev.get(d(3))!.mode).toBe("normal");
    expect(ev.get(d(3))!.status).toBe("success");
  });

  it("bugün tetiklenirse yarın ve öbür gün telafi olarak görünür", () => {
    const ev = evaluate(mk({ [d(0)]: 3150 }), d(0));
    expect(ev.get(d(1))!.mode).toBe("telafi");
    expect(ev.get(d(2))!.mode).toBe("telafi");
    expect(ev.get(d(1))!.status).toBe("future");
  });

  it("telafi gününde tekrar tetiklenirse sayaç baştan başlar", () => {
    const ev = evaluate(mk({ [d(0)]: 3200, [d(1)]: 3300 }), d(4));
    expect(ev.get(d(2))!.compIndex).toBe(1);
    expect(ev.get(d(3))!.compIndex).toBe(2);
    expect(ev.get(d(4))!.mode).toBe("normal");
  });

  it("kayıtsız günler de takvim günü olarak sayılır", () => {
    const ev = evaluate(mk({ [d(0)]: 3200 }), d(5));
    expect(ev.get(d(1))!.mode).toBe("telafi");
    expect(ev.get(d(2))!.mode).toBe("telafi");
    expect(ev.get(d(3))!.mode).toBe("normal");
  });
});

describe("Kural 3 — 10 günlük serbest öğün döngüsü", () => {
  it("10. günde kilit açılır", () => {
    const ev = evaluate(mk({}), d(9));
    expect(ev.get(d(8))!.cheatUnlocked).toBe(false);
    expect(ev.get(d(9))!.cycleDay).toBe(10);
    expect(ev.get(d(9))!.cheatUnlocked).toBe(true);
  });

  it("kullanılmazsa kilit açık bekler; kullanınca döngü sıfırlanır", () => {
    const ev = evaluate(mk({ [d(11)]: { kcal: 3000, cheat: true } }), d(13));
    expect(ev.get(d(10))!.cheatUnlocked).toBe(true);
    expect(ev.get(d(11))!.mode).toBe("serbest");
    expect(ev.get(d(11))!.status).toBe("free");
    expect(ev.get(d(12))!.cycleDay).toBe(1);
    expect(ev.get(d(12))!.cheatUnlocked).toBe(false);
  });

  it("serbest günde telafi yalnız tavan (3600) aşılınca tetiklenir", () => {
    const a = evaluate(mk({ [d(9)]: { kcal: 3400, cheat: true } }), d(10));
    expect(a.get(d(10))!.mode).toBe("normal");
    const b = evaluate(mk({ [d(9)]: { kcal: 3700, cheat: true } }), d(10));
    expect(b.get(d(9))!.status).toBe("trigger");
    expect(b.get(d(10))!.mode).toBe("telafi");
  });

  it("geçmişe göz atmak döngüyü kaydırmaz", () => {
    const ev = evaluate(mk({}), d(9), d(-30));
    expect(ev.get(d(9))!.cycleDay).toBe(10);
    expect(ev.get(d(-30))!.cheatUnlocked).toBe(false);
  });

  it("telafi sırasında kilit açılmaz", () => {
    const ev = evaluate(mk({ [d(8)]: 3200 }), d(10));
    expect(ev.get(d(9))!.cycleDay).toBe(10);
    expect(ev.get(d(9))!.cheatUnlocked).toBe(false);
    expect(ev.get(d(11))!.cheatUnlocked).toBe(true);
  });
});

describe("Açık & yağ motoru", () => {
  it("haftalık kümülatif açık ve yağ kaybı", () => {
    const days: Record<string, { kcal: number; trained: boolean }> = {};
    for (let i = 0; i < 7; i++) days[d(i)] = { kcal: 2100, trained: true }; // 2950-2100 = 850
    const data = mk(days);
    const r = deficitReport(data, evaluate(data, d(6)), d(6));
    expect(r.week).toBe(850 * 7);
    expect(r.weekFatKg).toBeCloseTo(5950 / 7700, 5);
    expect(r.avgDaily).toBe(850);
  });
});

describe("Seri & tartı", () => {
  it("bugün tamamlanmamışsa seri bozulmaz", () => {
    const data = mk({ [d(0)]: 2100, [d(1)]: 2050, [d(2)]: 500 });
    expect(streak(evaluate(data, d(2)), d(2))).toBe(2);
  });

  it("haftalık ortalamalar ve 7 günlük hareketli ortalama", () => {
    // 2026-10-05 Pazartesi
    const data = mk({
      "2026-10-05": { kcal: 0, weight: 100 },
      "2026-10-07": { kcal: 0, weight: 99 },
      "2026-10-12": { kcal: 0, weight: 98 },
    });
    const pts = weightSeries(data);
    expect(pts[1].avg7).toBe(99.5);
    const w = weeklyAverages(pts);
    expect(w).toHaveLength(2);
    expect(w[0].avg).toBe(99.5);
    expect(w[1].delta).toBe(-1.5);
  });
});
