import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { DayRecord, SuppId } from "../lib/types";
import { useAura } from "../store/useAura";
import { Bar, Btn, Icon, PanelTitle, SPRING } from "./ui";

const NO_SUPPS: DayRecord["supps"] = {};

const SUPPS: { id: SuppId; name: string; hint: string; night?: boolean }[] = [
  { id: "d3k2", name: "Vitamin D3 + K2", hint: "Yağlı öğünle" },
  { id: "omega3", name: "Omega 3", hint: "Öğünle birlikte" },
  { id: "zma", name: "ZMA", hint: "Gece · yatmadan önce", night: true },
];

/** Günlük takviye kontrol listesi — tamamlanınca ışık dalgası + titreşim */
export function Supplements() {
  const supps = useAura((s) => s.data.days[s.selected]?.supps ?? NO_SUPPS);
  const toggle = useAura((s) => s.toggleSupp);
  const done = SUPPS.filter((x) => supps[x.id]).length;
  const all = done === SUPPS.length;
  const [burst, setBurst] = useState(0);
  const selected = useAura((s) => s.selected);
  const prev = useRef({ all, selected });
  const isNight = new Date().getHours() >= 21;

  useEffect(() => {
    // Yalnızca aynı günde son kutu işaretlenince (gün değiştirince değil)
    if (all && !prev.current.all && prev.current.selected === selected) {
      setBurst((b) => b + 1);
      navigator.vibrate?.(18);
    }
    prev.current = { all, selected };
  }, [all, selected]);

  return (
    <section className={`panel p-4 overflow-hidden transition-colors ${all ? "!border-emerald/40" : ""}`}>
      <AnimatePresence>
        {burst > 0 && (
          <motion.div
            key={burst}
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(16,185,129,.45), rgba(6,182,212,.15) 40%, transparent 70%)" }}
            initial={{ opacity: 0.9, scale: 0.4 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 0.9, ease: [0.2, 0.9, 0.1, 1] }}
          />
        )}
      </AnimatePresence>
      <PanelTitle
        icon={<Icon.pill size={14} />}
        right={<span className={`num text-[11px] ${all ? "text-emerald" : "text-ink-3"}`}>{done}/3</span>}
      >
        Takviyeler
      </PanelTitle>
      <div className="relative space-y-1.5">
        {SUPPS.map((x) => {
          const on = !!supps[x.id];
          const nudge = x.night && isNight && !on;
          return (
            <motion.button
              key={x.id}
              type="button"
              onClick={() => toggle(x.id)}
              whileTap={{ scale: 0.96 }}
              transition={SPRING}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 border text-left transition-colors ${
                on
                  ? "border-emerald/30 bg-emerald/[0.07]"
                  : nudge
                    ? "border-violet/40 bg-violet/[0.06]"
                    : "border-line bg-veil/[0.02] hover:bg-veil/[0.04]"
              }`}
            >
              <span
                className={`size-5 rounded-md grid place-items-center border transition-all ${
                  on ? "bg-emerald border-emerald text-obsidian shadow-[0_0_12px_rgba(16,185,129,.6)]" : "border-veil/15"
                }`}
              >
                <AnimatePresence>
                  {on && (
                    <motion.span
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={SPRING}
                    >
                      <Icon.check size={13} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className="flex-1 min-w-0">
                <span className={`block text-[12.5px] font-medium ${on ? "text-ink-2 line-through decoration-emerald/50" : ""}`}>
                  {x.name}
                </span>
                <span className="block text-[10.5px] text-ink-3">{x.hint}</span>
              </span>
              {x.night && <Icon.moon size={14} />}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/** Su takibi — 100 kg sporcu için 3.5 L hedef */
export function Water() {
  const ml = useAura((s) => s.data.days[s.selected]?.waterMl ?? 0);
  const target = useAura((s) => s.data.settings.waterTargetMl);
  const add = useAura((s) => s.addWater);
  const cells = Math.ceil(target / 500);
  return (
    <section className="panel p-4">
      <PanelTitle
        icon={<Icon.drop size={14} />}
        right={
          <span className="num text-[11px] text-ink-3">
            <span className={ml >= target ? "text-cyan" : "text-ink"}>{(ml / 1000).toFixed(1)}</span> / {(target / 1000).toFixed(1)} L
          </span>
        }
      >
        Su
      </PanelTitle>
      <div className="flex items-center gap-2">
        <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${cells}, 1fr)` }}>
          {Array.from({ length: cells }).map((_, i) => {
            const fill = Math.max(0, Math.min(1, (ml - i * 500) / 500));
            return (
              <div key={i} className="h-7 rounded-md bg-veil/[0.04] overflow-hidden flex items-end">
                <motion.div
                  className="w-full bg-gradient-to-t from-cyan to-cyan-hi"
                  initial={false}
                  animate={{ height: `${fill * 100}%` }}
                  transition={SPRING}
                  style={{ boxShadow: fill ? "0 0 10px rgba(6,182,212,.5)" : undefined }}
                />
              </div>
            );
          })}
        </div>
        <Btn
          onClick={() => add(-250)}
          className="size-7 rounded-lg grid place-items-center border border-line text-ink-3 hover:text-ink"
          aria-label="250 ml azalt"
        >
          <Icon.minus size={13} />
        </Btn>
        <Btn onClick={() => add(500)} className="h-7 px-2.5 rounded-lg bg-cyan/15 text-cyan text-[11px] font-bold border border-cyan/30">
          +500
        </Btn>
      </div>
      <div className="mt-2">
        <Bar value={ml} max={target} tone="cyan" height={3} />
      </div>
    </section>
  );
}
