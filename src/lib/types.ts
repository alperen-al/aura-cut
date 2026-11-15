import type { DateKey } from "./date";
import type { Food, MealCategory } from "../data/meals";
import type { DbFood } from "../data/foodDb";

export type SuppId = "d3k2" | "omega3" | "zma";

export interface Entry {
  uid: string;
  foodId?: string;
  name: string;
  detail?: string;
  /** Birim değerler (qty=1 için) */
  kcal: number;
  protein: number;
  /** Gramajlı girişlerde karbonhidrat / yağ (g) */
  carbs?: number;
  fat?: number;
  /** Gramajlı girişte tartılan miktar */
  grams?: number;
  /** Kafein (mg, birim başına) */
  caffeine?: number;
  qty: number;
  category: MealCategory;
  at: number;
  cheat?: boolean;
}

export interface DayRecord {
  entries: Entry[];
  supps: Partial<Record<SuppId, boolean>>;
  waterMl: number;
  trained: boolean;
  weight?: number;
}

export interface Settings {
  kcalMin: number;
  kcalMax: number;
  kcalTarget: number;
  proteinTarget: number;
  /** Telafi protokolü bandı */
  compMin: number;
  compMax: number;
  compDays: number;
  /** Hedefin bu kadar üstü → telafi (2100 + 1000 = 3100) */
  triggerOver: number;
  /** Serbest öğün gününde telafiyi tetikleyen tavan */
  cheatCap: number;
  cheatEvery: number;
  tdeeTraining: number;
  tdeeRest: number;
  waterTargetMl: number;
  heightCm: number;
  startWeight: number;
  goalMin: number;
  goalMax: number;
  /** Döngünün ilk günü (hiç serbest öğün yoksa) */
  cycleStart: DateKey;
  rolloverHour: number;
  theme: "ultra" | "obsidyen";
  /** "always": Windows azaltılmış hareket açık olsa da animasyonlar oynar */
  motion: "always" | "system";
  guideSeen: boolean;
}

export interface AppData {
  version: 1;
  days: Record<DateKey, DayRecord>;
  customFoods: Food[];
  /** Kullanıcının 100 g değerleriyle eklediği besinler */
  customDb: DbFood[];
  settings: Settings;
}

export const emptyDay = (): DayRecord => ({ entries: [], supps: {}, waterMl: 0, trained: false });

export const defaultSettings = (today: DateKey): Settings => ({
  kcalMin: 2000,
  kcalMax: 2200,
  kcalTarget: 2100,
  proteinTarget: 150,
  compMin: 1500,
  compMax: 1600,
  compDays: 2,
  triggerOver: 1000,
  cheatCap: 3600,
  cheatEvery: 10,
  tdeeTraining: 2950,
  tdeeRest: 2750,
  waterTargetMl: 3500,
  heightCm: 183,
  startWeight: 100,
  goalMin: 75,
  goalMax: 80,
  cycleStart: today,
  rolloverHour: 4,
  theme: "ultra",
  motion: "always",
  guideSeen: false,
});
