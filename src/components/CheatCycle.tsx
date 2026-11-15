import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CHEAT_PRESETS } from "../data/meals";
import { useDerived } from "../lib/derived";
import { useAura } from "../store/useAura";
import { Btn, Icon, PanelTitle, SPRING } from "./ui";

/** Kural 3: 10 günde bir serbest öğün — döngü sayacı + kilitli giriş paneli */
export function CheatCycle() {
  const { selEval } = useDerived();
  const s = useAura((st) => st.data.settings);
  const addFood = useAura((st) => st.addFood);
  const resetCycle = useAura((st) => st.resetCycle);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");

  const used = selEval.mode === "serbest";
  const unlocked = selEval.cheatUnlocked || used;
  const day = Math.max(1, Math.min(selEval.cycleDay, s.cheatEvery));
  const left = Math.max(0, s.cheatEvery - selEval.cycleDay);

  return (
    <section
      className={`panel p-4 overflow-hidden transition-colors ${unlocked ? "!border-violet/45" : ""}`}
      style={unlocked ? { boxShadow: "0 0 32px -8px rgba(139,92,246,.45)" } : undefined}
    >
      {unlocked && (
        <div aria-hidden className="absolute -top-16 -right-10 size-44 rounded-full bg-violet/30 blur-3xl pointer-events-none" />
      )}
      <PanelTitle
        icon={unlocked ? <Icon.unlock size={14} /> : <Icon.lock size={14} />}
        right={
          <button
            onClick={resetCycle}
            className="text-[10.5px] text-ink-3 hover:text-violet transition-colors"
            title="Döngüyü bugünden başlat"
          >
            sıfırla
          </button>
        }
      >
        Serbest Öğün Döngüsü
      </PanelTitle>

      <div className="relative flex items-end justify-between mb-3">
        <div>
          <div className="num text-[30px] font-semibold leading-none">
            {selEval.cycleDay > s.cheatEvery ? `${s.cheatEvery}+` : day}
            <span className="text-[14px] text-ink-3">/{s.cheatEvery}</span>
          </div>
          <div className="text-[11px] text-ink-3 mt-1">
            {used ? "Serbest öğün kullanıldı" : unlocked ? "Kilit açık — hak bekliyor" : `${left} gün sonra kilit açılır`}
          </div>
        </div>
        <span className={`text-[10px] font-bold tracking-[0.16em] ${unlocked ? "text-violet" : "text-ink-3"}`}>
          {unlocked ? "AÇIK" : "KİLİTLİ"}
        </span>
      </div>

      {/* 10 segmentli döngü çubuğu */}
      <div className="relative grid grid-cols-10 gap-1 mb-3">
        {Array.from({ length: s.cheatEvery }).map((_, i) => {
          const filled = i < day;
          const last = i === s.cheatEvery - 1;
          return (
            <motion.span
              key={i}
              initial={false}
              animate={{ opacity: filled ? 1 : 0.35 }}
              className={`h-2 rounded-full ${filled ? (last ? "bg-violet shadow-[0_0_10px_#8B5CF6]" : "bg-gradient-to-r from-accent to-accent-2") : "bg-veil/10"}`}
            />
          );
        })}
      </div>

      <Btn
        disabled={!unlocked || used}
        onClick={() => setOpen((o) => !o)}
        className="relative w-full h-9 rounded-xl text-[12px] font-bold border transition-colors disabled:opacity-35 disabled:pointer-events-none
          border-violet/40 bg-violet/15 text-violet hover:bg-violet/25"
      >
        {used ? "Bu gün serbest öğün girildi" : unlocked ? (open ? "Kapat" : "Cheat Meal Girişi") : "Kilitli"}
      </Btn>

      <AnimatePresence initial={false}>
        {open && unlocked && !used && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="relative overflow-hidden"
          >
            <div className="pt-3 grid grid-cols-2 gap-1.5">
              {CHEAT_PRESETS.map((f) => (
                <Btn
                  key={f.id}
                  onClick={() => {
                    addFood(f, { cheat: true });
                    setOpen(false);
                  }}
                  className="text-left rounded-xl px-2.5 py-2 bg-veil/[0.03] border border-line hover:border-violet/40"
                >
                  <div className="text-[11.5px] font-semibold truncate">{f.name}</div>
                  <div className="num text-[10.5px] text-ink-3">~{f.kcal} kcal</div>
                </Btn>
              ))}
            </div>
            <form
              className="flex gap-1.5 mt-2"
              onSubmit={(e) => {
                e.preventDefault();
                const k = Math.round(Number(kcal));
                if (!name.trim() || !(k > 0)) return;
                addFood({ id: "cheat-custom", name: name.trim(), kcal: k, protein: 0, category: "cheat" }, { cheat: true });
                setName("");
                setKcal("");
                setOpen(false);
              }}
            >
              <input
                className="field !h-8 !text-[12px]"
                placeholder="Başka bir şey"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="field !h-8 !text-[12px] num !w-20"
                placeholder="kcal"
                type="number"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
              />
              <Btn type="submit" className="h-8 px-3 rounded-lg bg-violet text-white text-[11px] font-bold">
                Ekle
              </Btn>
            </form>
            <p className="text-[10.5px] text-ink-3 mt-2">Serbest günde telafi yalnızca {s.cheatCap} kcal aşılırsa tetiklenir.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
