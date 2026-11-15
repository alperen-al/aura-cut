/**
 * Gramajla hesaplanan besin veritabanı — değerler 100 g (sıvılarda 100 ml) başına.
 * Kural: gramajlar ÇİĞ / KURU tartılır ("Dışarıda" grubu hariç: o grup pişmiş porsiyondur).
 *
 * Kaynaklar:
 *  - Migros / Marka: migros.com.tr ürün sayfalarındaki üretici etiket tabloları (Ekim 2026'da kontrol edildi).
 *    Marka ürünleri (Banvit, Sütaş, Sek…) A101, Getir, BİM ve Migros'ta aynı etiketle satılır.
 *  - BİM (Dost): Open Food Facts / FatSecret TR üzerindeki ambalaj beyanları
 *  - Temel: USDA FoodData Central çiğ ortalamaları; patlak ve palamut kullanıcının kendi öğün verisinden türetildi
 *  - Dışarıda: restoran / Yemeksepeti porsiyonları için tipik pişmiş değer TAHMİNLERİ
 * Ambalaj değişebilir — şüphede etiketteki tablo esastır.
 */

export type DbSource = "temel" | "marka" | "bim" | "migros" | "disari" | "benim";

export interface DbFood {
  id: string;
  name: string;
  brand?: string;
  source: DbSource;
  /** Arama/gruplama: tavuk, et, balık… */
  group: DbGroup;
  /** 100 g / 100 ml başına */
  kcal: number;
  p: number;
  c: number;
  f: number;
  /** Pratik birim: 1 adet yumurta = 55 g gibi */
  unit?: { label: string; g: number };
  ml?: boolean;
}

export type DbGroup = "tavuk" | "et" | "balik" | "sut" | "karb" | "meyve" | "yag" | "disari" | "benim";

export const SOURCE_LABEL: Record<DbSource, string> = {
  temel: "Temel",
  marka: "Marka",
  bim: "BİM",
  migros: "Migros",
  disari: "Dışarıda",
  benim: "Benim",
};

export const GROUP_LABEL: Record<DbGroup, string> = {
  tavuk: "Tavuk & Hindi",
  et: "Kırmızı Et",
  balik: "Balık & Deniz",
  sut: "Süt · Yumurta",
  karb: "Karbonhidrat",
  meyve: "Meyve",
  yag: "Yağ · Kuruyemiş",
  disari: "Dışarıda / Yemeksepeti",
  benim: "Benim",
};

type Row = Omit<DbFood, "source" | "group">;
const T = (group: DbGroup, rows: Row[], source: DbSource = "temel"): DbFood[] => rows.map((r) => ({ ...r, group, source }));

export const FOOD_DB: DbFood[] = [
  // ── Tavuk & Hindi (çiğ) ─────────────────────────────────
  ...T("tavuk", [
    { id: "t-tavuk", name: "Tavuk göğsü (derisiz)", kcal: 120, p: 22.5, c: 0, f: 2.6 },
    { id: "t-tavuk-derili", name: "Tavuk göğsü (derili)", kcal: 172, p: 20.9, c: 0, f: 9.3 },
    { id: "t-tavuk-but", name: "Tavuk but / pirzola (derisiz, kemiksiz)", kcal: 121, p: 19.7, c: 0, f: 4.1 },
    { id: "t-tavuk-but-derili", name: "Tavuk but (derili)", kcal: 221, p: 16.5, c: 0, f: 16.6 },
    { id: "t-baget", name: "Tavuk baget (derisiz)", kcal: 116, p: 19.4, c: 0, f: 3.7 },
    { id: "t-baget-derili", name: "Tavuk baget (derili)", kcal: 161, p: 18.1, c: 0, f: 9.2 },
    { id: "t-kanat", name: "Tavuk kanat (derili)", kcal: 191, p: 17.5, c: 0, f: 12.9 },
    { id: "t-tavuk-kiyma", name: "Tavuk kıyma", kcal: 143, p: 17.4, c: 0, f: 8.1 },
    { id: "t-tavuk-butun", name: "Bütün tavuk (derili, kemiksiz et)", kcal: 215, p: 18.6, c: 0, f: 15.1 },
    { id: "t-tavuk-ciger", name: "Tavuk ciğeri", kcal: 119, p: 16.9, c: 0.7, f: 4.8 },
    { id: "t-taslik", name: "Tavuk taşlığı", kcal: 94, p: 17.7, c: 0, f: 2.1 },
    { id: "t-hindi", name: "Hindi göğsü", kcal: 114, p: 23.7, c: 0, f: 1.5 },
    { id: "t-hindi-but", name: "Hindi but (derisiz)", kcal: 125, p: 19.5, c: 0, f: 5 },
    { id: "t-hindi-kiyma", name: "Hindi kıyma (%7 yağ)", kcal: 149, p: 17.5, c: 0, f: 8.3 },
  ]),
  ...T(
    "tavuk",
    [
      { id: "mk-banvit-gogus", name: "Piliç Bonfile Göğüs", brand: "Banvit", kcal: 105, p: 22.4, c: 0, f: 1.7 },
      { id: "mk-banvit-hindi", name: "Hindi Bonfile", brand: "Banvit", kcal: 108, p: 25.1, c: 0, f: 0.9 },
      { id: "mk-keskinoglu-pirzola", name: "Piliç Soslu Pirzola", brand: "Keskinoğlu", kcal: 156, p: 16.5, c: 1.1, f: 9.5 },
      { id: "mk-hindi-gogus-fume", name: "Hindi Göğüs Füme", brand: "Yayla Türk", kcal: 131, p: 24, c: 1, f: 3.4 },
    ],
    "marka",
  ),
  ...T("tavuk", [{ id: "m-hindi-fume", name: "Hindi Füme Eti", brand: "Migros", kcal: 85, p: 17, c: 2, f: 1 }], "migros"),

  // ── Kırmızı Et (çiğ) ────────────────────────────────────
  ...T("et", [
    { id: "t-dana-yagsiz", name: "Dana bonfile / yağsız but", kcal: 142, p: 21.6, c: 0, f: 5.7 },
    { id: "t-dana-kusbasi", name: "Dana kuşbaşı (yağsız)", kcal: 135, p: 21.6, c: 0, f: 4.8 },
    { id: "t-dana-kontrfile", name: "Dana kontrfile", kcal: 167, p: 22.7, c: 0, f: 8 },
    { id: "t-dana-antrikot", name: "Dana antrikot", kcal: 224, p: 19.5, c: 0, f: 16 },
    { id: "t-kiyma5", name: "Dana kıyma %5 yağlı", kcal: 137, p: 21.4, c: 0, f: 5 },
    { id: "t-kiyma10", name: "Dana kıyma %10 yağlı", kcal: 176, p: 20, c: 0, f: 10 },
    { id: "t-kiyma15", name: "Dana kıyma %15 yağlı", kcal: 215, p: 18.6, c: 0, f: 15 },
    { id: "t-kiyma20", name: "Dana kıyma %20 yağlı", kcal: 254, p: 17.2, c: 0, f: 20 },
    { id: "t-bobrek", name: "Dana böbrek", kcal: 99, p: 17.4, c: 0.3, f: 3.1 },
    { id: "t-dana-ciger", name: "Dana ciğer", kcal: 135, p: 20.4, c: 3.9, f: 3.6 },
    { id: "t-kuzu-but", name: "Kuzu but (yağsız)", kcal: 128, p: 20.6, c: 0, f: 4.5 },
    { id: "t-kuzu-kusbasi", name: "Kuzu kuşbaşı", kcal: 160, p: 20, c: 0, f: 8.3 },
    { id: "t-kuzu-pirzola", name: "Kuzu pirzola", kcal: 230, p: 17.6, c: 0, f: 17.6 },
  ]),

  // ── Balık & Deniz Ürünleri (çiğ) ────────────────────────
  ...T("balik", [
    { id: "t-palamut", name: "Palamut (kılçıksız)", kcal: 155, p: 20, c: 0, f: 8 },
    { id: "t-somon", name: "Somon", kcal: 208, p: 20, c: 0, f: 13 },
    { id: "t-levrek", name: "Levrek", kcal: 97, p: 18.4, c: 0, f: 2 },
    { id: "t-cipura", name: "Çipura", kcal: 115, p: 19.8, c: 0, f: 3.9 },
    { id: "t-hamsi", name: "Hamsi", kcal: 131, p: 20.4, c: 0, f: 4.8 },
    { id: "t-uskumru", name: "Uskumru", kcal: 205, p: 18.6, c: 0, f: 13.9 },
    { id: "t-alabalik", name: "Alabalık", kcal: 141, p: 19.9, c: 0, f: 6.2 },
    { id: "t-mezgit", name: "Mezgit", kcal: 90, p: 18.3, c: 0, f: 1.3 },
    { id: "t-ton-taze", name: "Ton balığı (taze)", kcal: 109, p: 24.4, c: 0, f: 0.5 },
    { id: "t-karides", name: "Karides", kcal: 85, p: 20.1, c: 0, f: 0.5 },
    { id: "t-kalamar", name: "Kalamar", kcal: 92, p: 15.6, c: 3.1, f: 1.4 },
  ]),
  ...T(
    "balik",
    [{ id: "m-ton-light", name: "İri Parçalı Light Ton Balığı", brand: "Migros", kcal: 120, p: 22.5, c: 0.1, f: 3.3 }],
    "migros",
  ),

  // ── Süt ürünleri · Yumurta ──────────────────────────────
  ...T("sut", [
    { id: "t-yumurta", name: "Yumurta", kcal: 143, p: 12.6, c: 0.7, f: 9.5, unit: { label: "adet", g: 55 } },
    { id: "t-yumurta-beyaz", name: "Yumurta beyazı", kcal: 52, p: 10.9, c: 0.7, f: 0.2, unit: { label: "adet", g: 33 } },
    { id: "t-whey", name: "Whey protein tozu", kcal: 400, p: 80, c: 8, f: 6, unit: { label: "ölçek", g: 30 } },
  ]),
  ...T(
    "sut",
    [
      { id: "b-sut-yy", name: "Dost Yarım Yağlı Süt", brand: "Dost", kcal: 45, p: 3, c: 4.7, f: 1.5, ml: true },
      { id: "b-yogurt-ty", name: "Dost Tam Yağlı Yoğurt", brand: "Dost", kcal: 69, p: 4, c: 4.6, f: 3.8 },
      { id: "b-yogurt-yy", name: "Dost Yarım Yağlı Yoğurt", brand: "Dost", kcal: 57, p: 4.2, c: 5.5, f: 1.5 },
      { id: "b-suzme", name: "Dost Süzme Yoğurt", brand: "Dost", kcal: 115, p: 8, c: 5, f: 7 },
    ],
    "bim",
  ),
  ...T(
    "sut",
    [
      { id: "mk-sutas-suzme", name: "Sütaş Süzme Yoğurt", brand: "Sütaş", kcal: 97, p: 8, c: 3.9, f: 5.5 },
      { id: "mk-sutas-kaymaksiz", name: "Sütaş Kaymaksız Yoğurt", brand: "Sütaş", kcal: 73, p: 4, c: 5.7, f: 3.8 },
      { id: "mk-sutas-light", name: "Sütaş Light Yoğurt", brand: "Sütaş", kcal: 55, p: 4, c: 6.5, f: 1.5 },
      { id: "mk-sutas-ayran", name: "Sütaş Ayran", brand: "Sütaş", kcal: 32, p: 2, c: 2, f: 1.8, ml: true },
      { id: "mk-sek-light", name: "Sek Light Yoğurt", brand: "Sek", kcal: 50, p: 4, c: 7.1, f: 0.6 },
      { id: "mk-kefir-light", name: "Altınkılıç Kefir Light", brand: "Altınkılıç", kcal: 41, p: 2.8, c: 5.2, f: 1, ml: true },
      { id: "mk-lor", name: "Onur Böreklik Lor Peyniri", brand: "Onur", kcal: 122, p: 15, c: 11, f: 4 },
    ],
    "marka",
  ),

  // ── Karbonhidrat (KURU / ÇİĞ) ───────────────────────────
  ...T("karb", [
    { id: "t-patates", name: "Patates (çiğ)", kcal: 77, p: 2, c: 17.5, f: 0.1 },
    { id: "t-tatli-patates", name: "Tatlı patates (çiğ)", kcal: 86, p: 1.6, c: 20, f: 0.1 },
    { id: "t-basmati", name: "Basmati pirinç (kuru)", kcal: 356, p: 8, c: 78, f: 0.6 },
    { id: "t-tam-makarna", name: "Tam buğday makarna (kuru)", kcal: 352, p: 14.6, c: 71, f: 1.4 },
    { id: "t-kinoa", name: "Kinoa (kuru)", kcal: 368, p: 14.1, c: 64.2, f: 6.1 },
    { id: "t-karabugday", name: "Karabuğday (kuru)", kcal: 343, p: 13.3, c: 71.5, f: 3.4 },
    { id: "t-nohut", name: "Nohut (kuru)", kcal: 364, p: 19, c: 61, f: 6 },
    { id: "t-fasulye", name: "Kuru fasulye (kuru)", kcal: 333, p: 23.6, c: 60, f: 0.8 },
    { id: "t-yulaf", name: "Yulaf ezmesi", kcal: 379, p: 13.2, c: 67.7, f: 6.5 },
    { id: "t-patlak", name: "Karabuğday patlağı", kcal: 382, p: 13, c: 75, f: 3, unit: { label: "adet", g: 11 } },
    { id: "t-tam-ekmek", name: "Tam buğday ekmeği", kcal: 247, p: 13, c: 41, f: 3.4, unit: { label: "dilim", g: 30 } },
    { id: "t-cavdar-ekmek", name: "Çavdar ekmeği", kcal: 259, p: 8.5, c: 48, f: 3.3, unit: { label: "dilim", g: 30 } },
  ]),
  ...T(
    "karb",
    [
      { id: "m-baldo", name: "Baldo Pirinç (kuru)", brand: "Migros", kcal: 346, p: 7, c: 78.4, f: 0.3 },
      { id: "m-bulgur", name: "İri Pilavlık Bulgur (kuru)", brand: "Migros", kcal: 332, p: 11.2, c: 65, f: 0.8 },
      { id: "m-spagetti", name: "Spagetti Makarna (kuru)", brand: "Migros", kcal: 344, p: 11, c: 72.1, f: 0.2 },
      { id: "m-mercimek", name: "Kırmızı Mercimek (kuru)", brand: "Migros", kcal: 315, p: 24.8, c: 39.7, f: 1.4 },
      { id: "m-yulaf", name: "M Life Yulaf Ezmesi", brand: "M Life", kcal: 390, p: 14, c: 60, f: 9.5 },
    ],
    "migros",
  ),

  // ── Meyve ───────────────────────────────────────────────
  ...T("meyve", [
    { id: "t-muz", name: "Muz", kcal: 89, p: 1.1, c: 22.8, f: 0.3, unit: { label: "adet", g: 120 } },
    { id: "t-elma", name: "Elma", kcal: 52, p: 0.3, c: 14, f: 0.2, unit: { label: "adet", g: 180 } },
    { id: "t-portakal", name: "Portakal", kcal: 47, p: 0.9, c: 11.8, f: 0.1, unit: { label: "adet", g: 180 } },
    { id: "t-kivi", name: "Kivi", kcal: 61, p: 1.1, c: 14.7, f: 0.5, unit: { label: "adet", g: 75 } },
    { id: "t-cilek", name: "Çilek", kcal: 32, p: 0.7, c: 7.7, f: 0.3 },
    { id: "t-yaban-mersini", name: "Yaban mersini", kcal: 57, p: 0.7, c: 14.5, f: 0.3 },
    { id: "t-hurma", name: "Hurma (Medjool)", kcal: 277, p: 1.8, c: 75, f: 0.2, unit: { label: "adet", g: 24 } },
  ]),

  // ── Yağ · Kuruyemiş ─────────────────────────────────────
  ...T("yag", [
    { id: "t-zeytinyagi", name: "Zeytinyağı", kcal: 884, p: 0, c: 0, f: 100, unit: { label: "yemek kaşığı", g: 13 } },
    { id: "t-tereyagi", name: "Tereyağı", kcal: 717, p: 0.9, c: 0.1, f: 81, unit: { label: "yemek kaşığı", g: 14 } },
    { id: "t-avokado", name: "Avokado", kcal: 160, p: 2, c: 8.5, f: 14.7 },
    { id: "t-fistik-ezmesi", name: "Fıstık ezmesi (şekersiz)", kcal: 588, p: 25, c: 20, f: 50, unit: { label: "yemek kaşığı", g: 16 } },
    { id: "t-badem", name: "Badem (çiğ)", kcal: 579, p: 21, c: 22, f: 50 },
    { id: "t-ceviz", name: "Ceviz içi", kcal: 654, p: 15, c: 14, f: 65 },
    { id: "t-findik", name: "Fındık (çiğ)", kcal: 628, p: 15, c: 16.7, f: 61 },
  ]),

  // ── Dışarıda / Yemeksepeti (PİŞMİŞ porsiyon, tahmini) ───
  ...T(
    "disari",
    [
      { id: "d-tavuk-sis", name: "Tavuk şiş (ızgara)", kcal: 165, p: 31, c: 0, f: 3.6, unit: { label: "porsiyon", g: 200 } },
      { id: "d-izgara-kofte", name: "Izgara köfte", kcal: 250, p: 20, c: 4, f: 17, unit: { label: "porsiyon", g: 180 } },
      { id: "d-tavuk-doner", name: "Tavuk döner (et)", kcal: 190, p: 22, c: 3, f: 10, unit: { label: "porsiyon", g: 150 } },
      { id: "d-izgara-levrek", name: "Izgara levrek", kcal: 124, p: 23.6, c: 0, f: 2.6, unit: { label: "porsiyon", g: 250 } },
      { id: "d-pilav", name: "Pirinç pilavı", kcal: 150, p: 2.7, c: 28, f: 3, unit: { label: "porsiyon", g: 200 } },
      { id: "d-bulgur-pilavi", name: "Bulgur pilavı", kcal: 125, p: 3.5, c: 22, f: 2.5, unit: { label: "porsiyon", g: 200 } },
      { id: "d-mercimek-corba", name: "Mercimek çorbası", kcal: 60, p: 3.5, c: 8.5, f: 1.5, unit: { label: "kase", g: 300 } },
      {
        id: "d-fit-tabak",
        name: "Fit tabak (ızgara tavuk + bulgur + salata)",
        kcal: 130,
        p: 12,
        c: 12,
        f: 3.5,
        unit: { label: "porsiyon", g: 450 },
      },
      { id: "d-tavuk-wrap", name: "Tavuk wrap", kcal: 200, p: 14, c: 20, f: 7, unit: { label: "adet", g: 250 } },
    ],
    "disari",
  ),
];

export interface Macros {
  kcal: number;
  p: number;
  c: number;
  f: number;
}

/** Gram → makro (1 ondalık) */
export const macrosFor = (food: Pick<DbFood, "kcal" | "p" | "c" | "f">, grams: number): Macros => {
  const k = grams / 100;
  const r = (v: number) => Math.round(v * k * 10) / 10;
  return { kcal: Math.round(food.kcal * k), p: r(food.p), c: r(food.c), f: r(food.f) };
};

/** Türkçe duyarlı, aksan-toleranslı arama (ç→c, ğ→g, ı→i …) */
const fold = (s: string) =>
  s.toLocaleLowerCase("tr-TR").replace(/[çğıöşü]/g, (ch) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[ch] ?? ch);

export const searchFoods = (list: DbFood[], q: string) => {
  const terms = fold(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return list;
  return list.filter((f) => {
    const hay = fold(`${f.name} ${f.brand ?? ""} ${SOURCE_LABEL[f.source]} ${GROUP_LABEL[f.group]}`);
    return terms.every((t) => hay.includes(t));
  });
};
