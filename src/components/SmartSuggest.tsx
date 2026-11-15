import { motion } from "motion/react";
import { useMemo } from "react";
import { FOODS, type Food, type MealCategory } from "../data/meals";
import { useDerived } from "../lib/derived";
import { useAura } from "../store/useAura";
import { Icon, PanelTitle, SPRING } from "./ui";

/** Saate göre beklenen öğün */
const slotFor = (h: number): MealCategory => (h < 11 ? "kahvalti" : h < 17 ? "gun-ici" : h < 21 ? "aksam" : "gece");

/**
 * Akıllı öneri: kalan bütçeye (band üstüne kadar) sığan öğünleri;
 * protein yoğunluğu, bütçeyi doldurma oranı ve günün saatine uygunluğa göre puanlar.
 */
export function rankSuggestions(foods: Food[], room: number, proteinGap: number, slot: MealCategory, n = 3) {
  if (room <= 40) return [];
  return foods
    .filter((f) => f.kcal <= room && f.kcal > 0)
    .map((f) => {
      const density = (f.protein * 4) / f.kcal; // kalorinin proteinden gelen oranı
      const fill = f.kcal / room;
      const proteinFit = proteinGap > 0 ? Math.min(1, f.protein / proteinGap) : 0;
      const score = density * (proteinGap > 0 ? 1.4 : 0.4) + fill * 0.8 + proteinFit * 0.6 + (f.category === slot ? 0.35 : 0);
      return { f, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.f);
}

export function SmartSuggest() {
  const { selEval } = useDerived();
  const proteinTarget = useAura((s) => s.data.settings.proteinTarget);
  const custom = useAura((s) => s.data.customFoods);
  const add = useAura((s) => s.addFood);
  const { kcal, protein, band, mode } = selEval;

  const room = band.max - kcal;
  const toTarget = band.target - kcal;
  const proteinGap = proteinTarget - protein;
  const slot = slotFor(new Date().getHours());

  const picks = useMemo(() => rankSuggestions([...FOODS, ...custom], room, proteinGap, slot), [custom, room, proteinGap, slot]);

  if (mode === "serbest") return null;

  return (
    <section className="panel p-4">
      <PanelTitle
        icon={<Icon.spark size={14} />}
        right={
          <span className="num text-[11px] text-ink-3">
            bütçe <span className="text-ink">{Math.max(0, room)}</span> kcal · protein açığı{" "}
            <span className={proteinGap > 0 ? "text-cyan" : "text-emerald"}>{Math.max(0, proteinGap)}g</span>
          </span>
        }
      >
        Akıllı Öneri
      </PanelTitle>

      {picks.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-veil/[0.02] border border-line px-4 py-3">
          <span className="text-emerald">
            <Icon.check />
          </span>
          <p className="text-[12px] text-ink-2">
            {room <= 0
              ? "Bugünün bütçesi doldu. Açlık olursa sebze serbest — kalori sayılmaz."
              : `Hedefe ${toTarget} kcal kaldı; listede bu bütçeye sığan öğün yok. Sebze ve su ile kapat.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {picks.map((f, i) => {
            const after = kcal + f.kcal;
            const afterP = protein + f.protein;
            const inBand = after >= band.min && after <= band.max;
            return (
              <motion.button
                key={f.id}
                type="button"
                onClick={() => add(f)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: i * 0.04 }}
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -2 }}
                className="group text-left rounded-2xl p-3 border border-line bg-gradient-to-br from-cyan/[0.06] to-transparent hover:border-cyan/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="num text-[10px] font-bold text-cyan">#{i + 1}</span>
                  <span className="size-6 rounded-lg grid place-items-center bg-veil/[0.04] text-ink-3 group-hover:bg-cyan group-hover:text-obsidian transition-colors">
                    <Icon.plus size={13} />
                  </span>
                </div>
                <div className="text-[12.5px] font-semibold mt-1 truncate">{f.name}</div>
                <div className="num text-[11px] text-ink-3">
                  {f.kcal} kcal · <span className="text-cyan">{f.protein}g P</span>
                </div>
                <div className={`num text-[10.5px] mt-1.5 ${inBand ? "text-emerald" : "text-ink-3"}`}>
                  → {after} kcal · {afterP}g {inBand && "✓"}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
}
