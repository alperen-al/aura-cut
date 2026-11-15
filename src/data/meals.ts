export type MealCategory = "kahvalti" | "gun-ici" | "aksam" | "gece" | "cheat" | "ozel" | "ekstra";

export interface Food {
  id: string;
  name: string;
  /** Kısa alt başlık: içerik/gramaj dökümü */
  detail?: string;
  kcal: number;
  protein: number;
  category: MealCategory;
  tag?: string;
  /** Hazır paketli ürün mü */
  ready?: boolean;
  /** Kafein (mg) */
  caffeine?: number;
}

export interface Combo {
  id: string;
  name: string;
  hint: string;
  foodIds: string[];
  accent: "emerald" | "cyan" | "violet";
}

export type LibraryTab = "kahvalti" | "gun-ici" | "aksam" | "gece" | "gram" | "ekstra";

export const CATEGORIES: { id: LibraryTab; label: string }[] = [
  { id: "kahvalti", label: "Kahvaltı" },
  { id: "gun-ici", label: "Gün İçi" },
  { id: "aksam", label: "Akşam" },
  { id: "gece", label: "Gece" },
  { id: "gram", label: "Gram ile" },
  { id: "ekstra", label: "Ekstra" },
];

/** Günlük listesinde kategori etiketi */
export const CATEGORY_LABEL: Record<MealCategory, string> = {
  kahvalti: "Kahvaltı",
  "gun-ici": "Gün İçi",
  aksam: "Akşam",
  gece: "Gece",
  cheat: "Serbest",
  ozel: "Gramaj",
  ekstra: "Ekstra",
};

export const FOODS: Food[] = [
  // ── KAHVALTI ─────────────────────────────────────────────
  {
    id: "k1",
    name: "Klasik Güç",
    detail: "4 yumurta · 5 karabuğday patlağı · 60g labne · 80g lor · salatalık",
    kcal: 700,
    protein: 46,
    category: "kahvalti",
    tag: "K1",
  },
  {
    id: "k2",
    name: "Hafif Yüksek Protein",
    detail: "4 yumurta · 5 patlak · 100g lor · salatalık",
    kcal: 605,
    protein: 44,
    category: "kahvalti",
    tag: "K2",
  },
  {
    id: "k3",
    name: "Lif & Yulaf",
    detail: "60g yulaf · 250ml %1 süt · 1 ölçek whey · muz",
    kcal: 560,
    protein: 42,
    category: "kahvalti",
    tag: "K3",
  },
  {
    id: "k4",
    name: "Bulut Ekmek",
    detail: "4 beyaz + 1 sarı + 1 üçgen peynir · tavada 3 sarı · sebze · 5 zeytin",
    kcal: 405,
    protein: 30,
    category: "kahvalti",
    tag: "K4",
  },

  // ── GÜN İÇİ / ATIŞTIRMALIK ───────────────────────────────
  { id: "s-icim", name: "İçim Fit Kakaolu Süt", detail: "400 ml", kcal: 190, protein: 26, category: "gun-ici", ready: true },
  { id: "s-pre", name: "Pre-Workout Shake", detail: "Muz · 1 ölçek whey · 250 ml süt", kcal: 330, protein: 33, category: "gun-ici" },
  { id: "s-zuber", name: "Züber Protein Bar", detail: "1 adet", kcal: 146, protein: 15, category: "gun-ici", ready: true },
  { id: "s-eti", name: "Eti Protein Bar", detail: "1 adet", kcal: 189, protein: 12, category: "gun-ici", ready: true },
  { id: "s-cips", name: "Protein Cipsi", detail: "50 g", kcal: 257, protein: 14, category: "gun-ici", ready: true },
  {
    id: "s-ultra",
    name: "White Monster",
    detail: "Ultra White · 500 ml · şekersiz · 150 mg kafein",
    kcal: 10,
    protein: 0,
    caffeine: 150,
    category: "gun-ici",
    tag: "ULTRA",
    ready: true,
  },
  { id: "s-patlak", name: "Karabuğday Patlağı", detail: "1 adet", kcal: 42, protein: 1, category: "gun-ici" },

  // ── AKŞAM ANA ÖĞÜN ───────────────────────────────────────
  {
    id: "a1",
    name: "Tavuk & Fırın Patates",
    detail: "400g tavuk göğsü · 1 kg fırında patates · 15g zeytinyağı",
    kcal: 1375,
    protein: 100,
    category: "aksam",
    tag: "A1",
  },
  {
    id: "a2",
    name: "Tavuk · Patates · Yoğurt",
    detail: "450g tavuk · 700g patates · 400g yoğurt",
    kcal: 1350,
    protein: 118,
    category: "aksam",
    tag: "A2",
  },
  {
    id: "a3",
    name: "Palamut & Patates",
    detail: "400g palamut (kılçıksız) · 540g patates · salata · 13g zeytinyağı",
    kcal: 1160,
    protein: 92,
    category: "aksam",
    tag: "A3",
  },
  {
    id: "a4",
    name: "Dana Böbrek & Patates",
    detail: "430g dana böbrek · 1 kg haşlanmış patates",
    kcal: 1210,
    protein: 73,
    category: "aksam",
    tag: "A4",
  },
  { id: "h-izgara", name: "Izgara Tavuk + Sebze", detail: "Hazır öğün", kcal: 350, protein: 34, category: "aksam", ready: true },
  { id: "h-kori", name: "Köri Soslu Tavuklu Fusilli", detail: "Hazır öğün", kcal: 740, protein: 46, category: "aksam", ready: true },
  { id: "h-tatli", name: "Tatlı Ekşi Tavuk + Basmati", detail: "Hazır öğün", kcal: 635, protein: 25, category: "aksam", ready: true },
  { id: "h-noodle", name: "Tavuklu Noodle", detail: "Hazır öğün", kcal: 360, protein: 22, category: "aksam", ready: true },

  // ── GECE ─────────────────────────────────────────────────
  {
    id: "g1",
    name: "Gece Protein Kasesi",
    detail: "300g yoğurt · 58g whey · muz · 2 patlak",
    kcal: 630,
    protein: 60,
    category: "gece",
    tag: "G1",
  },
  {
    id: "g2",
    name: "Gece Yumurta Tabağı",
    detail: "5 yumurta · 60g labne · 1 üçgen peynir · 50g hindi füme · 3 patlak · sebze",
    kcal: 680,
    protein: 42,
    category: "gece",
    tag: "G2",
  },
  {
    id: "g3",
    name: "Gece Cacığı",
    detail: "200g yoğurt · 155g salatalık · nane",
    kcal: 170,
    protein: 7,
    category: "gece",
    tag: "G3",
  },
];

/** Serbest öğün (10. gün) için hızlı tahmini şablonlar */
export const CHEAT_PRESETS: Food[] = [
  { id: "c-pizza", name: "Pizza", detail: "Orta boy · 4 dilim", kcal: 1100, protein: 45, category: "cheat" },
  { id: "c-burger", name: "Hamburger Menü", detail: "Burger · patates · içecek", kcal: 1250, protein: 40, category: "cheat" },
  { id: "c-durum", name: "Et Döner Dürüm", detail: "Tek dürüm", kcal: 750, protein: 38, category: "cheat" },
  { id: "c-lahmacun", name: "2 Lahmacun + Ayran", detail: "", kcal: 780, protein: 34, category: "cheat" },
  { id: "c-cikolata", name: "Çikolata", detail: "100 g sütlü", kcal: 540, protein: 7, category: "cheat" },
  { id: "c-baklava", name: "Baklava", detail: "4 dilim", kcal: 660, protein: 10, category: "cheat" },
];

export const COMBOS: Combo[] = [
  {
    id: "combo-gunun",
    name: "Günün Kombosu",
    hint: "Kahvaltı 2 · İçim Fit · Akşam 1",
    foodIds: ["k2", "s-icim", "a1"],
    accent: "emerald",
  },
  {
    id: "combo-antrenman",
    name: "Antrenman Günü",
    hint: "Kahvaltı 1 · Pre-Workout · Akşam 3",
    foodIds: ["k1", "s-pre", "a3"],
    accent: "cyan",
  },
  {
    id: "combo-telafi",
    name: "Telafi Kombosu",
    hint: "Kahvaltı 4 · Izgara Tavuk · İçim Fit · Gece 1",
    foodIds: ["k4", "h-izgara", "s-icim", "g1"],
    accent: "violet",
  },
];

const ALL = [...FOODS, ...CHEAT_PRESETS];
export const findFood = (id: string): Food | undefined => ALL.find((f) => f.id === id);

export const comboTotals = (c: Combo) =>
  c.foodIds.reduce(
    (acc, id) => {
      const f = findFood(id);
      return f ? { kcal: acc.kcal + f.kcal, protein: acc.protein + f.protein } : acc;
    },
    { kcal: 0, protein: 0 },
  );

export const NOTES = {
  weighIn: "Sabah, tuvalet sonrası, aç karnına, kıyafetsiz.",
  grams: "Gramajlar çiğ/kuru tartılır. Sebze serbest, patates/pirinç karbonhidrat sayılır.",
};
