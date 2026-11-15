import { AnimatePresence, motion } from "motion/react";
import { useId } from "react";
import { findFood } from "../data/meals";
import type { Entry } from "../lib/types";
import { useAura } from "../store/useAura";
import { Bar, Btn, Icon, PanelTitle, SPRING } from "./ui";

const LIMIT_MG = 400; // yetişkin için günlük güvenli üst sınır (EFSA)
const NO_ENTRIES: Entry[] = [];

/** Ultra Sayacı — White Monster kutuları + günlük kafein */
export function UltraCard() {
  const entries = useAura((s) => s.data.days[s.selected]?.entries ?? NO_ENTRIES);
  const addFood = useAura((s) => s.addFood);
  const cans = entries.filter((e) => e.foodId === "s-ultra").reduce((a, e) => a + e.qty, 0);
  const mg = Math.round(entries.reduce((a, e) => a + (e.caffeine ?? 0) * e.qty, 0));
  const late = new Date().getHours() >= 16;
  const over = mg > LIMIT_MG;
  const slots = Math.max(3, Math.ceil(cans));

  return (
    <section className="panel p-4 overflow-hidden">
      <ClawMarks className="absolute -right-3 -top-2 w-28 text-ink opacity-[0.06] pointer-events-none" />
      <PanelTitle
        icon={<Icon.bolt size={14} />}
        right={
          <span className={`num text-[11px] ${over ? "text-rose" : "text-ink-3"}`}>
            <span className={over ? "" : "text-ink"}>{mg}</span> / {LIMIT_MG} mg
          </span>
        }
      >
        Ultra Sayacı
      </PanelTitle>

      <div className="relative flex items-end gap-2.5">
        <div className="flex items-end gap-1.5 flex-1">
          {Array.from({ length: slots }).map((_, i) => {
            const fill = Math.max(0, Math.min(1, cans - i));
            return <Can key={i} fill={fill} />;
          })}
        </div>
        <Btn
          onClick={() => {
            const f = findFood("s-ultra");
            if (f) addFood(f);
          }}
          className="h-9 px-3 rounded-xl bg-accent text-on-accent text-[11.5px] font-bold flex items-center gap-1.5 shadow-[0_6px_18px_-6px_var(--accent-glow)]"
        >
          <Icon.plus size={13} /> Kutu
        </Btn>
      </div>

      <div className="mt-3">
        <Bar value={mg} max={LIMIT_MG} tone={over ? "rose" : mg > 300 ? "amber" : "cyan"} height={4} />
      </div>
      <AnimatePresence initial={false}>
        {(over || (late && mg > 0)) && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING}
            className={`text-[10.5px] mt-2 ${over ? "text-rose" : "text-ink-3"}`}
          >
            {over ? "Günlük 400 mg sınırını aştın — bugünlük bu kadar." : "16:00 sonrası kafein uykuyu ve toparlanmayı bozabilir."}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Logosuz, jenerik beyaz kutu illüstrasyonu — içi doldukça gümüş-buz parlar */
function Can({ fill }: { fill: number }) {
  const id = useId().replace(/:/g, "");
  const on = fill > 0;
  return (
    <motion.svg
      width="22"
      height="40"
      viewBox="0 0 22 40"
      initial={false}
      animate={{ y: on ? 0 : 2, opacity: on ? 1 : 0.45 }}
      transition={SPRING}
      style={on ? { filter: "drop-shadow(0 4px 6px rgb(12 14 20 / 0.18))" } : undefined}
    >
      <defs>
        <linearGradient id={`${id}b`} x1="0" x2="1">
          <stop stopColor="#D9DEE6" />
          <stop offset=".35" stopColor="#FFFFFF" />
          <stop offset=".7" stopColor="#F1F4F8" />
          <stop offset="1" stopColor="#C9D0DA" />
        </linearGradient>
        <linearGradient id={`${id}t`} x1="0" x2="1">
          <stop stopColor="#9AA3B0" />
          <stop offset=".5" stopColor="#E9EDF2" />
          <stop offset="1" stopColor="#8E97A5" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <rect x="2" y="5" width="18" height="33" rx="3" />
        </clipPath>
      </defs>
      {/* Gövde */}
      <rect
        x="2"
        y="5"
        width="18"
        height="33"
        rx="3"
        fill={on ? `url(#${id}b)` : "none"}
        stroke="#AEB6C2"
        strokeWidth={on ? 0.6 : 1}
        strokeDasharray={on ? undefined : "2 2"}
      />
      {/* Kapak */}
      <path d="M4 5.5 5.5 2h11L18 5.5Z" fill={on ? `url(#${id}t)` : "none"} stroke="#AEB6C2" strokeWidth=".6" />
      {on && (
        <g clipPath={`url(#${id}c)`}>
          {/* Kısmi kutu: üstten boşalan kısım */}
          <rect x="2" y="5" width="18" height={33 * (1 - fill)} fill="#EEF1F5" opacity=".85" />
          {/* Gümüş çizik izleri */}
          <path d="M7 14 9.5 30M11 12.5l2.4 17M15 14l2 14" stroke="#B9C1CC" strokeWidth="1.3" strokeLinecap="round" />
          <rect x="2" y="33" width="18" height="2" fill="#0C0E14" opacity=".85" />
        </g>
      )}
    </motion.svg>
  );
}

/** Dört eğik pençe izi — Ultra Beyaz temasının dekoratif imzası */
export function ClawMarks({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="currentColor" className={className} aria-hidden>
      <path d="M22 8c4 18 3 40-2 62s-6 34-4 44c-6-12-9-30-5-52S22 22 22 8Z" />
      <path d="M48 4c5 20 5 44 0 68s-5 36-2 46c-7-13-10-33-6-57S48 18 48 4Z" />
      <path d="M74 6c5 19 6 42 1 65s-4 34-1 43c-7-12-11-31-7-54S74 19 74 6Z" />
      <path d="M99 14c4 16 4 35 0 54s-3 28-1 36c-6-10-8-26-5-45s6-32 6-45Z" />
    </svg>
  );
}

/** Ultra temada pencerenin köşelerinde çok silik pençe izleri */
export function ClawBackdrop() {
  const theme = useAura((s) => s.data.settings.theme);
  if (theme !== "ultra") return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <ClawMarks className="absolute -right-10 top-10 w-[340px] text-ink opacity-[0.035] rotate-[18deg]" />
      <ClawMarks className="absolute -left-16 -bottom-24 w-[300px] text-ink opacity-[0.03] -rotate-[12deg]" />
    </div>
  );
}
