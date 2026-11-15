/**
 * AURA CUT — Akıllı motor.
 * Tamamen saf fonksiyonlar: aynı veri → aynı sonuç. Telafi protokolü ve serbest öğün
 * döngüsü kayıtlı bayraklar yerine geçmişten yeniden hesaplanır; böylece geçmiş bir günü
 * düzenlemek tüm zinciri otomatik ve tutarlı şekilde günceller.
 */
import { addDays, diffDays, range, weekStart, type DateKey } from "./date";
import type { AppData, DayRecord, Settings } from "./types";

export const KCAL_PER_KG_FAT = 7700;

export type DayMode = "normal" | "telafi" | "serbest";
export type DayStatus =
  | "empty" // kayıt yok (geçmiş)
  | "open" // bugün, henüz kayıt yok
  | "future"
  | "under" // hedef altı
  | "success" // hedef bandında → BAŞARILI GÜN
  | "over" // hedef üstü ama tetik altı
  | "trigger" // +1000 → telafi protokolü tetiklendi
  | "free"; // serbest öğün günü, tavan altında

export interface DayEval {
  date: DateKey;
  kcal: number;
  protein: number;
  hasEntries: boolean;
  mode: DayMode;
  /** Telafi günüyse 1..compDays */
  compIndex?: number;
  band: { min: number; max: number; target: number };
  /** Bu değere ulaşılırsa telafi tetiklenir */
  triggerAt: number;
  status: DayStatus;
  /** Serbest öğün döngüsünde kaçıncı gün (1'den başlar, kilit açıkken 10+) */
  cycleDay: number;
  cheatUnlocked: boolean;
  tdee: number;
}

export const dayTotals = (d?: DayRecord) => {
  let kcal = 0;
  let protein = 0;
  if (d)
    for (const e of d.entries) {
      kcal += e.kcal * e.qty;
      protein += e.protein * e.qty;
    }
  return { kcal: Math.round(kcal), protein: Math.round(protein) };
};

export const tdeeFor = (d: DayRecord | undefined, s: Settings) => (d?.trained ? s.tdeeTraining : s.tdeeRest);

const classify = (kcal: number, has: boolean, mode: DayMode, band: DayEval["band"], triggerAt: number): DayStatus => {
  if (!has) return "empty";
  if (kcal >= triggerAt) return "trigger";
  if (mode === "serbest") return "free";
  if (kcal < band.min) return "under";
  if (kcal <= band.max) return "success";
  return "over";
};

/**
 * Tüm günleri kronolojik olarak değerlendirir: `from` (ilk kayıt / döngü başı) → `today + compDays`.
 * Kural 1: band içi → başarılı. Kural 2: tetik → sonraki N gün telafi bandı.
 * Kural 3: son serbest öğünden 10 gün sonra kilit açılır; kullanılmazsa açık bekler.
 */
export function evaluate(data: AppData, today: DateKey, earliest?: DateKey): Map<DateKey, DayEval> {
  const s = data.settings;
  const keys = Object.keys(data.days).sort();
  // Döngünün 1. günü: döngü başlangıcı ya da (daha önceyse) ilk kayıt
  let anchor = s.cycleStart;
  if (keys.length && keys[0] < anchor) anchor = keys[0];
  let from = anchor;
  if (today < from) from = today;
  if (earliest && earliest < from) from = earliest;
  const floor = addDays(today, -40); // analiz ekranları için her zaman ≥ 40 gün
  if (floor < from) from = floor;
  const to = addDays(today, s.compDays);

  const out = new Map<DateKey, DayEval>();
  let compLeft = 0;
  let compIdx = 0;

  for (const date of range(from, to)) {
    const rec = data.days[date];
    const { kcal, protein } = dayTotals(rec);
    const has = !!rec && rec.entries.length > 0;
    const usedCheat = !!rec?.entries.some((e) => e.cheat);
    const cycleDay = diffDays(anchor, date) + 1;
    const inComp = compLeft > 0;

    let mode: DayMode = "normal";
    let band = { min: s.kcalMin, max: s.kcalMax, target: s.kcalTarget };
    let triggerAt = s.kcalTarget + s.triggerOver;

    if (inComp) {
      mode = "telafi";
      compIdx += 1;
      band = { min: s.compMin, max: s.compMax, target: Math.round((s.compMin + s.compMax) / 2) };
    } else compIdx = 0;

    if (usedCheat && !inComp) {
      mode = "serbest";
      triggerAt = Math.max(triggerAt, s.cheatCap);
    }

    let status = classify(kcal, has, mode, band, triggerAt);
    if (date > today) status = "future";
    else if (date === today && !has) status = "open";

    out.set(date, {
      date,
      kcal,
      protein,
      hasEntries: has,
      mode,
      compIndex: inComp ? compIdx : undefined,
      band,
      triggerAt,
      status,
      cycleDay,
      cheatUnlocked: cycleDay >= s.cheatEvery && !inComp,
      tdee: tdeeFor(rec, s),
    });

    // Sonraki günlere etki
    if (inComp) compLeft -= 1;
    if (date <= today && has && kcal >= triggerAt) {
      compLeft = s.compDays; // yeniden tetiklenirse sayaç baştan
      compIdx = 0;
    }
    if (usedCheat) anchor = addDays(date, 1);
  }
  return out;
}

/** Geriye doğru ardışık başarılı gün sayısı. Bugün henüz tamamlanmadıysa seriyi bozmaz. */
export function streak(evals: Map<DateKey, DayEval>, today: DateKey): number {
  const ok = (e?: DayEval) => !!e && (e.status === "success" || e.status === "free");
  let n = 0;
  let k = today;
  if (ok(evals.get(k))) n++;
  k = addDays(k, -1);
  while (ok(evals.get(k))) {
    n++;
    k = addDays(k, -1);
  }
  return n;
}

export interface DeficitReport {
  today: number;
  week: number;
  weekFatKg: number;
  loggedDays: number;
  series: { date: DateKey; deficit: number | null }[];
  avgDaily: number | null;
}

export function deficitReport(data: AppData, evals: Map<DateKey, DayEval>, today: DateKey, span = 14): DeficitReport {
  const series = range(addDays(today, -(span - 1)), today).map((date) => {
    const e = evals.get(date);
    return { date, deficit: e?.hasEntries ? tdeeFor(data.days[date], data.settings) - e.kcal : null };
  });
  const last7 = series.slice(-7).filter((x) => x.deficit !== null) as { date: DateKey; deficit: number }[];
  const week = last7.reduce((a, x) => a + x.deficit, 0);
  // Ortalama için tamamlanmış günleri tercih et (bugün yarım olabilir)
  const done = series.filter((x) => x.deficit !== null && x.date < today) as { deficit: number }[];
  const pool = done.length ? done : (series.filter((x) => x.deficit !== null) as { deficit: number }[]);
  const avgDaily = pool.length ? pool.reduce((a, x) => a + x.deficit, 0) / pool.length : null;
  const t = series[series.length - 1];
  return {
    today: t.deficit ?? 0,
    week,
    weekFatKg: week / KCAL_PER_KG_FAT,
    loggedDays: last7.length,
    series,
    avgDaily,
  };
}

export interface WeightPoint {
  date: DateKey;
  weight: number;
  avg7: number;
}

export function weightSeries(data: AppData): WeightPoint[] {
  const pts = Object.entries(data.days)
    .filter(([, d]) => typeof d.weight === "number")
    .map(([date, d]) => ({ date, weight: d.weight as number }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  return pts.map((p) => {
    const win = pts.filter((q) => q.date <= p.date && diffDays(q.date, p.date) < 7);
    return { ...p, avg7: win.reduce((a, q) => a + q.weight, 0) / win.length };
  });
}

export interface WeekAvg {
  week: DateKey;
  avg: number;
  count: number;
  delta: number | null;
}

export function weeklyAverages(points: WeightPoint[]): WeekAvg[] {
  const groups = new Map<DateKey, number[]>();
  for (const p of points) {
    const w = weekStart(p.date);
    groups.set(w, [...(groups.get(w) ?? []), p.weight]);
  }
  const weeks = [...groups.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  let prev: number | null = null;
  return weeks.map(([week, ws]) => {
    const avg = ws.reduce((a, b) => a + b, 0) / ws.length;
    const row = { week, avg, count: ws.length, delta: prev === null ? null : avg - prev };
    prev = avg;
    return row;
  });
}

export interface Projection {
  current: number;
  toGoal: number;
  days: number | null;
  eta: DateKey | null;
  bmi: number;
}

export function projection(data: AppData, points: WeightPoint[], avgDeficit: number | null, today: DateKey): Projection | null {
  const s = data.settings;
  const last = points[points.length - 1];
  const current = last ? last.avg7 : s.startWeight;
  const toGoal = Math.max(0, current - s.goalMax);
  const days = avgDeficit && avgDeficit > 50 ? Math.ceil((toGoal * KCAL_PER_KG_FAT) / avgDeficit) : null;
  const m = s.heightCm / 100;
  return {
    current,
    toGoal,
    days,
    eta: days !== null ? addDays(today, days) : null,
    bmi: current / (m * m),
  };
}

/** Hedefe giden yolda ilerleme yüzdesi (başlangıç → üst hedef) */
export const goalProgress = (s: Settings, current: number) => {
  const span = s.startWeight - s.goalMax;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (s.startWeight - current) / span));
};
