import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CATEGORIES, COMBOS, FOODS, NOTES, comboTotals, type Food, type LibraryTab } from "../data/meals";
import { ExtraBox } from "./ExtraBox";
import { GramCalculator } from "./GramCalculator";
import { useDerived } from "../lib/derived";
import { useAura } from "../store/useAura";
import { Icon, SPRING, TONE_HEX, type Tone } from "./ui";

/** Ekleme sonrası toplam hangi bölgeye düşer → kart hover önizlemesi */
function useProjection() {
  const { selEval } = useDerived();
  return (add: number): { total: number; tone: Tone } => {
    const total = selEval.kcal + add;
    const { band, triggerAt, mode } = selEval;
    const tone: Tone =
      total >= triggerAt ? "rose" : mode === "serbest" ? "violet" : total > band.max ? "amber" : total >= band.min ? "emerald" : "cyan";
    return { total, tone };
  };
}

export function MealLibrary() {
  const [cat, setCat] = useState<LibraryTab>("kahvalti");
  const foods = FOODS.filter((f) => f.category === cat);

  return (
    <section className="space-y-4">
      <Combos />

      <div className="panel p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex gap-1 p-1 rounded-xl bg-base/50 border border-line">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`relative h-8 px-3.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors ${
                  cat === c.id ? "text-on-accent" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                {cat === c.id && (
                  <motion.span
                    layoutId="cat-pill"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent to-accent-2 shadow-[0_0_18px_var(--accent-glow)]"
                    transition={SPRING}
                  />
                )}
                <span className="relative">{c.label}</span>
              </button>
            ))}
          </div>
          <span className="text-[11px] text-ink-3 hidden 2xl:flex items-center gap-1.5 max-w-[320px] truncate" title={NOTES.grams}>
            <Icon.info size={13} /> {NOTES.grams}
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
          >
            {cat === "gram" ? (
              <GramCalculator />
            ) : cat === "ekstra" ? (
              <ExtraBox />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5">
                {foods.map((f) => (
                  <FoodCard key={f.id} food={f} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function FoodCard({ food }: { food: Food }) {
  const add = useAura((s) => s.addFood);
  const remove = useAura((s) => s.removeCustomFood);
  const project = useProjection();
  const [flash, setFlash] = useState(0);
  const { total, tone } = project(food.kcal);
  const density = food.kcal ? (food.protein * 4) / food.kcal : 0; // proteinden gelen kalori oranı

  return (
    <motion.button
      type="button"
      onClick={() => {
        add(food);
        setFlash((n) => n + 1);
      }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      transition={SPRING}
      className="group relative text-left rounded-2xl p-3.5 bg-veil/[0.022] border border-line hover:border-emerald/35 hover:bg-veil/[0.04] transition-colors overflow-hidden"
    >
      {/* Ekleme ışık patlaması */}
      <AnimatePresence>
        {flash > 0 && (
          <motion.span
            key={flash}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(16,185,129,.35), transparent 70%)" }}
            initial={{ opacity: 1, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {food.tag && <span className="num text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-emerald/12 text-emerald">{food.tag}</span>}
            {food.ready && <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-cyan/10 text-cyan">HAZIR</span>}
          </div>
          <div className="text-[13.5px] font-semibold leading-snug text-ink">{food.name}</div>
        </div>
        <span className="shrink-0 size-7 rounded-lg grid place-items-center bg-veil/[0.04] text-ink-3 group-hover:bg-accent group-hover:text-on-accent transition-colors">
          <Icon.plus size={15} />
        </span>
      </div>

      {food.detail && <p className="relative text-[11px] leading-relaxed text-ink-3 mt-1.5 line-clamp-2 min-h-[2.6em]">{food.detail}</p>}

      <div className="relative flex items-end justify-between mt-3">
        <div className="flex items-baseline gap-3">
          <span className="num text-[18px] font-semibold text-ink">
            {food.kcal}
            <span className="text-[10.5px] text-ink-3 ml-0.5">kcal</span>
          </span>
          <span className="num text-[13px] font-semibold text-cyan">
            {food.protein}
            <span className="text-[10.5px] text-ink-3 ml-0.5">g P</span>
          </span>
        </div>
        {/* Protein yoğunluğu göstergesi */}
        <div className="flex gap-[3px]" title={`Kalorinin %${Math.round(density * 100)}'i proteinden`}>
          {[0.15, 0.25, 0.35, 0.45].map((t) => (
            <span key={t} className={`w-[3px] h-3 rounded-full ${density >= t ? "bg-emerald" : "bg-veil/10"}`} />
          ))}
        </div>
      </div>

      {/* Hover: eklersen toplam */}
      <div className="relative mt-2.5 pt-2 border-t border-line flex items-center justify-between text-[10.5px] opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-ink-3">Eklersen</span>
        <span className="num font-semibold" style={{ color: TONE_HEX[tone] }}>
          {total} kcal
        </span>
      </div>

      {food.category === "ozel" && (
        <span
          role="button"
          tabIndex={-1}
          onClick={(ev) => {
            ev.stopPropagation();
            remove(food.id);
          }}
          className="absolute bottom-2 left-3 text-[10px] text-ink-3 hover:text-rose opacity-0 group-hover:opacity-100"
        >
          kaldır
        </span>
      )}
    </motion.button>
  );
}

const ACCENT: Record<string, string> = { emerald: "#10B981", cyan: "#06B6D4", violet: "#8B5CF6" };

function Combos() {
  const addCombo = useAura((s) => s.addCombo);
  const project = useProjection();
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {COMBOS.map((c, i) => {
        const t = comboTotals(c);
        const pr = project(t.kcal);
        const col = ACCENT[c.accent];
        return (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => addCombo(c)}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -2 }}
            transition={SPRING}
            className="group relative text-left rounded-2xl p-4 border overflow-hidden"
            style={{ borderColor: `${col}40`, background: `linear-gradient(135deg, ${col}1f, var(--panel-a) 62%)` }}
          >
            <div
              aria-hidden
              className="absolute -right-8 -top-8 size-28 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"
              style={{ background: col }}
            />
            <div className="relative flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.18em]" style={{ color: col }}>
                {i === 0 ? "TEK TUŞ" : "KOMBO"}
              </span>
              <Icon.bolt size={14} />
            </div>
            <div className="relative text-[14.5px] font-semibold mt-1.5">{c.name}</div>
            <div className="relative text-[11px] text-ink-3 mt-0.5 truncate">{c.hint}</div>
            <div className="relative flex items-baseline gap-3 mt-3">
              <span className="num text-[20px] font-semibold">{t.kcal}</span>
              <span className="text-[10.5px] text-ink-3 -ml-2">kcal</span>
              <span className="num text-[14px] font-semibold text-cyan">{t.protein}g P</span>
            </div>
            <div
              className="relative text-[10.5px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity num"
              style={{ color: TONE_HEX[pr.tone] }}
            >
              → toplam {pr.total} kcal
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
