/** YYYY-MM-DD (yerel saat) */
export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, "0");

export const toKey = (d: Date): DateKey => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromKey = (k: DateKey): Date => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d, 12); // öğlen: DST kaymalarına karşı güvenli
};

export const addDays = (k: DateKey, n: number): DateKey => {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

/** b - a (gün) */
export const diffDays = (a: DateKey, b: DateKey): number => {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
};

/**
 * Gün dönümü saati: gece 00:30'da yenen gece öğünü önceki güne yazılır.
 * rolloverHour=4 → 04:00'a kadar "dün" sayılır.
 */
export const effectiveToday = (now: Date, rolloverHour: number): DateKey => {
  const d = new Date(now);
  if (d.getHours() < rolloverHour) d.setDate(d.getDate() - 1);
  return toKey(d);
};

/** Pazartesi başlangıçlı hafta anahtarı */
export const weekStart = (k: DateKey): DateKey => {
  const dow = (fromKey(k).getDay() + 6) % 7; // Pzt=0
  return addDays(k, -dow);
};

export const range = (from: DateKey, to: DateKey): DateKey[] => {
  const out: DateKey[] = [];
  for (let k = from; diffDays(k, to) >= 0; k = addDays(k, 1)) out.push(k);
  return out;
};

const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const DAYS_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export const fmtLong = (k: DateKey) => {
  const d = fromKey(k);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${DAYS[d.getDay()]}`;
};
export const fmtShort = (k: DateKey) => {
  const d = fromKey(k);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};
export const fmtDow = (k: DateKey) => DAYS_SHORT[fromKey(k).getDay()];
export const fmtTime = (ts: number) => {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
