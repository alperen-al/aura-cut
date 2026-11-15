import { create } from "zustand";
import { findFood, type Combo, type Food } from "../data/meals";
import { macrosFor, type DbFood } from "../data/foodDb";
import { addDays, effectiveToday, type DateKey } from "../lib/date";
import { flush, loadRaw, scheduleSave } from "../lib/storage";
import { defaultSettings, emptyDay, type AppData, type DayRecord, type Entry, type Settings, type SuppId } from "../lib/types";

export type View = "today" | "weight" | "analytics" | "motivation";

export interface Toast {
  id: number;
  text: string;
  tone: "emerald" | "cyan" | "amber" | "rose" | "violet";
  undo?: boolean;
}

interface AuraState {
  ready: boolean;
  data: AppData;
  today: DateKey;
  selected: DateKey;
  view: View;
  settingsOpen: boolean;
  guideOpen: boolean;
  toast: Toast | null;
  undoSnapshot: { date: DateKey; day: DayRecord | undefined } | null;

  init: () => Promise<void>;
  tick: () => void;
  setView: (v: View) => void;
  setSettingsOpen: (o: boolean) => void;
  setGuideOpen: (o: boolean) => void;
  toggleTheme: () => void;
  selectDate: (d: DateKey) => void;
  shiftDate: (n: number) => void;

  addFood: (f: Food, opts?: { cheat?: boolean; qty?: number }) => void;
  addCombo: (c: Combo) => void;
  addGrams: (f: DbFood, grams: number) => void;
  addExtra: (name: string, kcal: number, protein?: number) => void;
  saveDbFood: (f: Omit<DbFood, "id" | "source" | "group">) => void;
  removeDbFood: (id: string) => void;
  removeEntry: (uid: string) => void;
  clearDay: () => void;
  setQty: (uid: string, qty: number) => void;
  undo: () => void;

  toggleSupp: (id: SuppId) => void;
  addWater: (ml: number) => void;
  toggleTrained: () => void;
  setWeight: (w: number | undefined, date?: DateKey) => void;

  saveCustomFood: (f: Omit<Food, "id" | "category">) => Food;
  removeCustomFood: (id: string) => void;
  updateSettings: (p: Partial<Settings>) => void;
  resetCycle: () => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
  showToast: (t: Omit<Toast, "id">) => void;
  dismissToast: () => void;
}

const nowToday = (rollover = 4) => effectiveToday(new Date(), rollover);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const freshData = (today: DateKey): AppData => ({
  version: 1,
  days: {},
  customFoods: [],
  customDb: [],
  settings: defaultSettings(today),
});

/** Bozuk/eski veriyi güvenli şekilde normalize eder */
function hydrate(raw: string | null, today: DateKey): AppData {
  if (!raw) return freshData(today);
  try {
    const p = JSON.parse(raw) as Partial<AppData>;
    if (p.version !== 1 || typeof p.days !== "object" || !p.days) return freshData(today);
    const days: AppData["days"] = {};
    for (const [k, d] of Object.entries(p.days)) days[k] = { ...emptyDay(), ...d, entries: d.entries ?? [] };
    return {
      version: 1,
      days,
      customFoods: Array.isArray(p.customFoods) ? p.customFoods : [],
      customDb: Array.isArray(p.customDb) ? p.customDb : [],
      settings: { ...defaultSettings(today), ...(p.settings ?? {}) },
    };
  } catch {
    return freshData(today);
  }
}

const entryFrom = (f: Food, qty = 1, cheat = false): Entry => ({
  uid: uid(),
  foodId: f.id,
  name: f.name,
  detail: f.detail,
  kcal: f.kcal,
  protein: f.protein,
  qty,
  category: f.category,
  at: Date.now(),
  cheat: cheat || undefined,
  caffeine: f.caffeine,
});

let toastSeq = 0;

export const useAura = create<AuraState>((set, get) => {
  /** Bir günü değiştirir; snapshot=true ise "Geri al" için önceki halini saklar */
  const mutateDay = (fn: (d: DayRecord) => DayRecord, date = get().selected, snapshot = false) => {
    const { data } = get();
    const prev = data.days[date];
    const next = fn(prev ? { ...prev, entries: [...prev.entries], supps: { ...prev.supps } } : emptyDay());
    set({
      data: { ...data, days: { ...data.days, [date]: next } },
      ...(snapshot ? { undoSnapshot: { date, day: prev } } : {}),
    });
  };

  const t0 = nowToday();

  return {
    ready: false,
    data: freshData(t0),
    today: t0,
    selected: t0,
    view: "today",
    settingsOpen: false,
    guideOpen: false,
    toast: null,
    undoSnapshot: null,

    init: async () => {
      const data = hydrate(await loadRaw(), nowToday());
      const today = nowToday(data.settings.rolloverHour);
      // İlk açılışta kullanım kılavuzu kendiliğinden gelir
      set({ data, today, selected: today, ready: true, guideOpen: !data.settings.guideSeen });
      useAura.subscribe((s, p) => {
        if (s.data !== p.data) scheduleSave(JSON.stringify(s.data));
      });
      window.addEventListener("beforeunload", () => void flush());
    },

    tick: () => {
      const { today, selected, data } = get();
      const t = nowToday(data.settings.rolloverHour);
      if (t !== today) set({ today: t, selected: selected === today ? t : selected });
    },

    setView: (view) => set({ view }),
    setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
    setGuideOpen: (guideOpen) => {
      set({ guideOpen });
      if (!guideOpen && !get().data.settings.guideSeen) get().updateSettings({ guideSeen: true });
    },
    toggleTheme: () => get().updateSettings({ theme: get().data.settings.theme === "ultra" ? "obsidyen" : "ultra" }),
    selectDate: (d) => set({ selected: d > get().today ? get().today : d }),
    shiftDate: (n) => get().selectDate(addDays(get().selected, n)),

    addFood: (f, opts) => {
      mutateDay((d) => ({ ...d, entries: [...d.entries, entryFrom(f, opts?.qty, opts?.cheat)] }), undefined, true);
      get().showToast({
        text: f.caffeine
          ? `⚡ Ultra mod · +${f.caffeine * (opts?.qty ?? 1)} mg kafein`
          : `${f.name} · +${Math.round(f.kcal * (opts?.qty ?? 1))} kcal`,
        tone: opts?.cheat ? "violet" : f.caffeine ? "cyan" : "emerald",
        undo: true,
      });
    },

    addCombo: (c) => {
      const foods = c.foodIds.map(findFood).filter(Boolean) as Food[];
      mutateDay((d) => ({ ...d, entries: [...d.entries, ...foods.map((f) => entryFrom(f))] }), undefined, true);
      const kcal = foods.reduce((a, f) => a + f.kcal, 0);
      get().showToast({ text: `${c.name} · ${foods.length} öğün · ${kcal} kcal`, tone: "cyan", undo: true });
    },

    addGrams: (f, grams) => {
      const m = macrosFor(f, grams);
      const unit = f.ml ? "ml" : "g";
      const entry: Entry = {
        uid: uid(),
        foodId: f.id,
        name: f.name,
        detail: `${grams} ${unit}`,
        kcal: m.kcal,
        protein: m.p,
        carbs: m.c,
        fat: m.f,
        grams,
        qty: 1,
        category: "ozel",
        at: Date.now(),
      };
      mutateDay((d) => ({ ...d, entries: [...d.entries, entry] }), undefined, true);
      get().showToast({ text: `${f.name} ${grams}${unit} · +${m.kcal} kcal`, tone: "emerald", undo: true });
    },

    addExtra: (name, kcal, protein = 0) => {
      const entry: Entry = {
        uid: uid(),
        name,
        detail: "Ekstra",
        kcal: Math.round(kcal),
        protein: Math.round(protein),
        qty: 1,
        category: "ekstra",
        at: Date.now(),
      };
      mutateDay((d) => ({ ...d, entries: [...d.entries, entry] }), undefined, true);
      get().showToast({ text: `Ekstra · ${name} · +${Math.round(kcal)} kcal`, tone: "amber", undo: true });
    },

    saveDbFood: (f) => {
      const { data } = get();
      const food: DbFood = { ...f, id: `db-${uid()}`, source: "benim", group: "benim" };
      set({ data: { ...data, customDb: [...data.customDb, food] } });
      get().showToast({ text: `${f.name} besinlerine kaydedildi`, tone: "cyan" });
    },
    removeDbFood: (id) => {
      const { data } = get();
      set({ data: { ...data, customDb: data.customDb.filter((f) => f.id !== id) } });
    },

    removeEntry: (id) => {
      mutateDay((d) => ({ ...d, entries: d.entries.filter((e) => e.uid !== id) }), undefined, true);
      get().showToast({ text: "Öğün silindi", tone: "rose", undo: true });
    },

    clearDay: () => {
      const n = get().data.days[get().selected]?.entries.length ?? 0;
      if (!n) return;
      mutateDay((d) => ({ ...d, entries: [] }), undefined, true);
      get().showToast({ text: `${n} kayıt silindi`, tone: "rose", undo: true });
    },

    setQty: (id, qty) =>
      mutateDay((d) => ({
        ...d,
        entries: d.entries.map((e) => (e.uid === id ? { ...e, qty: Math.max(0.5, Math.min(20, qty)) } : e)),
      })),

    undo: () => {
      const snap = get().undoSnapshot;
      if (!snap) return;
      const { data } = get();
      const days = { ...data.days };
      if (snap.day) days[snap.date] = snap.day;
      else delete days[snap.date];
      set({ data: { ...data, days }, undoSnapshot: null, toast: { id: ++toastSeq, text: "Geri alındı", tone: "cyan" } });
    },

    toggleSupp: (id) => mutateDay((d) => ({ ...d, supps: { ...d.supps, [id]: !d.supps[id] } })),
    addWater: (ml) => mutateDay((d) => ({ ...d, waterMl: Math.max(0, Math.min(8000, d.waterMl + ml)) })),
    toggleTrained: () => mutateDay((d) => ({ ...d, trained: !d.trained })),
    setWeight: (w, date) => {
      mutateDay((d) => ({ ...d, weight: w }), date ?? get().selected);
      if (w) get().showToast({ text: `Tartı kaydedildi · ${w.toFixed(1)} kg`, tone: "cyan" });
    },

    saveCustomFood: (f) => {
      const food: Food = { ...f, id: `u-${uid()}`, category: "ozel" };
      const { data } = get();
      set({ data: { ...data, customFoods: [...data.customFoods, food] } });
      return food;
    },
    removeCustomFood: (id) => {
      const { data } = get();
      set({ data: { ...data, customFoods: data.customFoods.filter((f) => f.id !== id) } });
    },

    updateSettings: (p) => {
      const { data } = get();
      set({ data: { ...data, settings: { ...data.settings, ...p } } });
    },

    resetCycle: () => {
      get().updateSettings({ cycleStart: get().today });
      get().showToast({ text: "Serbest öğün döngüsü bugünden başlatıldı", tone: "violet" });
    },

    exportJson: () => JSON.stringify(get().data, null, 2),
    importJson: (json) => {
      try {
        const p = JSON.parse(json);
        if (p?.version !== 1 || typeof p.days !== "object") return false;
        set({ data: hydrate(json, get().today) });
        get().showToast({ text: "Yedek geri yüklendi", tone: "emerald" });
        return true;
      } catch {
        return false;
      }
    },

    showToast: (t) => set({ toast: { ...t, id: ++toastSeq } }),
    dismissToast: () => set({ toast: null }),
  };
});
