import { describe, expect, it } from "vitest";
import { FOOD_DB, macrosFor, searchFoods } from "./foodDb";

const byId = (id: string) => FOOD_DB.find((f) => f.id === id)!;

describe("gram hesaplayıcı", () => {
  it("250 g çiğ tavuk göğsü", () => {
    expect(macrosFor(byId("t-tavuk"), 250)).toEqual({ kcal: 300, p: 56.3, c: 0, f: 6.5 });
  });
  it("80 g kuru Migros baldo pirinç", () => {
    expect(macrosFor(byId("m-baldo"), 80)).toEqual({ kcal: 277, p: 5.6, c: 62.7, f: 0.2 });
  });
  it("etiket değerleri tutarlı: makrolardan gelen enerji beyan edilen kaloriyi aşmaz (±%15)", () => {
    for (const f of FOOD_DB) {
      const est = f.p * 4 + f.c * 4 + f.f * 9;
      expect(est, f.name).toBeLessThan(f.kcal * 1.15);
    }
  });
});

describe("Türkçe arama", () => {
  it("aksansız yazımla bulur", () => {
    expect(searchFoods(FOOD_DB, "tavuk gogsu").map((f) => f.id)).toContain("t-tavuk");
    expect(searchFoods(FOOD_DB, "pirinc").length).toBeGreaterThanOrEqual(2);
  });
  it("markayla filtreler", () => {
    expect(searchFoods(FOOD_DB, "dost yogurt").every((f) => f.brand === "Dost")).toBe(true);
  });
});
