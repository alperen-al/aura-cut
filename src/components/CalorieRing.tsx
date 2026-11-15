import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useDerived } from "../lib/derived";
import { useAura } from "../store/useAura";
import { AnimatedNumber, Bar, SOFT, TONE_HEX, type Tone } from "./ui";

const SIZE = 236;
const STROKE = 13;
const R = SIZE / 2 - STROKE - 4;
const C = 2 * Math.PI * R;
const R2 = R - 19;
const C2 = 2 * Math.PI * R2;

export function CalorieRing() {
  const { selEval: e } = useDerived();
  const s = useAura((st) => st.data.settings);
  const { kcal, protein, band, triggerAt, mode } = e;

  const tone: Tone =
    kcal >= triggerAt ? "rose" : mode === "serbest" ? "violet" : kcal > band.max ? "amber" : kcal >= band.min ? "emerald" : "cyan";
  const color = TONE_HEX[tone];
  const scale = mode === "serbest" ? s.cheatCap : band.max;
  const p = Math.min(kcal, scale) / scale;
  const over = Math.max(0, kcal - scale);
  const p2 = Math.min(1, over / scale);
  const minAngle = (band.min / scale) * 360 - 90;

  const headline =
    tone === "rose"
      ? "Telafi tetiklendi"
      : tone === "violet"
        ? "Serbest gün"
        : tone === "amber"
          ? `+${kcal - band.max} kcal fazla`
          : tone === "emerald"
            ? "Hedef vuruldu"
            : kcal === 0
              ? "Gün başlıyor"
              : `Banda ${band.min - kcal} kcal`;

  const deficit = e.tdee - kcal;

  // Aynı gün içinde banda ilk giriş → kutlama patlaması
  const [burst, setBurst] = useState(0);
  const prev = useRef({ date: e.date, ok: tone === "emerald" });
  useEffect(() => {
    const ok = tone === "emerald";
    if (ok && !prev.current.ok && prev.current.date === e.date) setBurst((b) => b + 1);
    prev.current = { date: e.date, ok };
  }, [tone, e.date]);

  return (
    <section className="panel neon-edge p-5 overflow-hidden">
      {/* Arka ışıma: ton değişince yumuşakça geçer */}
      <motion.div
        aria-hidden
        className="absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full blur-3xl pointer-events-none"
        animate={{ backgroundColor: color, opacity: kcal ? 0.16 : 0.07 }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative flex items-center justify-between mb-1">
        <span className="label">{mode === "telafi" ? "Telafi bandı" : mode === "serbest" ? "Serbest gün tavanı" : "Hedef bandı"}</span>
        <span className="num text-[11px] text-ink-2">{mode === "serbest" ? `≤ ${s.cheatCap}` : `${band.min}–${band.max}`} kcal</span>
      </div>

      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <Celebration burst={burst} />
        {/* Bandın içindeyken yavaşça nefes alan hale */}
        {tone === "emerald" && (
          <motion.div
            aria-hidden
            className="absolute inset-6 rounded-full pointer-events-none"
            style={{ boxShadow: "0 0 40px 6px rgba(16,185,129,.35)" }}
            animate={{ opacity: [0.35, 0.9, 0.35], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          {/* Taksimat */}
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const r1 = R + STROKE / 2 + 5;
            const r2 = r1 + (i % 5 === 0 ? 5 : 2.5);
            return (
              <line
                key={i}
                x1={SIZE / 2 + Math.cos(a) * r1}
                y1={SIZE / 2 + Math.sin(a) * r1}
                x2={SIZE / 2 + Math.cos(a) * r2}
                y2={SIZE / 2 + Math.sin(a) * r2}
                stroke="var(--color-veil)"
                strokeOpacity={i % 5 === 0 ? 0.14 : 0.06}
                strokeWidth={1}
              />
            );
          })}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="var(--color-veil)" strokeOpacity=".05" strokeWidth={STROKE} fill="none" />
          {/* Hedef bandı yayı (min → max) */}
          {mode !== "serbest" && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={TONE_HEX.emerald}
              strokeOpacity=".16"
              strokeWidth={STROKE}
              strokeDasharray={`${C * (1 - band.min / band.max)} ${C}`}
              strokeDashoffset={-C * (band.min / band.max)}
            />
          )}
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={C}
            initial={false}
            animate={{ strokeDashoffset: C * (1 - p), stroke: color }}
            transition={SOFT}
            style={{ filter: `drop-shadow(0 0 7px ${color}aa)` }}
          />
          {/* Taşma halkası */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R2}
            stroke="var(--color-veil)"
            strokeOpacity={over ? 0.04 : 0}
            strokeWidth={4}
            fill="none"
          />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R2}
            fill="none"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={C2}
            initial={false}
            animate={{ strokeDashoffset: C2 * (1 - p2), stroke: kcal >= triggerAt ? TONE_HEX.rose : TONE_HEX.amber, opacity: over ? 1 : 0 }}
            transition={SOFT}
          />
        </svg>

        {/* Band başlangıç işareti */}
        {mode !== "serbest" && (
          <div
            className="absolute left-1/2 top-1/2 h-[3px] w-[26px] origin-left rounded-full bg-emerald shadow-[0_0_8px_#10B981]"
            style={{ transform: `rotate(${minAngle}deg) translateX(${R - 13}px)` }}
          />
        )}

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="label !text-[9.5px] mb-1">Alınan</div>
            <AnimatedNumber value={kcal} className="num block text-[46px] leading-none font-semibold text-ink" />
            <div className="num text-[11.5px] text-ink-3 mt-1.5">/ {band.target} kcal</div>
            <motion.div
              key={headline}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2.5 text-[11.5px] font-semibold"
              style={{ color }}
            >
              {headline}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2.5 mt-4">
        <div className="rounded-2xl bg-veil/[0.025] border border-line p-3">
          <div className="flex items-baseline justify-between">
            <span className="label !tracking-[0.14em]">Protein</span>
            <span className="num text-[11px] text-ink-3">/{s.proteinTarget}g</span>
          </div>
          <div className="num text-[22px] font-semibold mt-1 mb-2">
            <AnimatedNumber value={protein} />
            <span className="text-[13px] text-ink-3 ml-0.5">g</span>
          </div>
          <Bar value={protein} max={s.proteinTarget} tone={protein >= s.proteinTarget ? "emerald" : "cyan"} />
        </div>
        <div className="rounded-2xl bg-veil/[0.025] border border-line p-3">
          <div className="flex items-baseline justify-between">
            <span className="label !tracking-[0.14em]">Açık</span>
            <span className="num text-[11px] text-ink-3">TDEE {e.tdee}</span>
          </div>
          <div className={`num text-[22px] font-semibold mt-1 mb-2 ${deficit < 0 ? "text-rose" : "text-emerald"}`}>
            <AnimatedNumber value={deficit} />
          </div>
          <div className="num text-[11px] text-ink-3">≈ {Math.max(0, deficit / 7.7).toFixed(0)} g yağ</div>
        </div>
      </div>
    </section>
  );
}

const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  const d = 105 + (i % 3) * 18;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d, c: ["#10B981", "#06B6D4", "#34D399", "#A7F3D0"][i % 4], s: 5 + (i % 3) * 2 };
});

/** Hedef vuruldu: halkadan dışa saçılan parçacıklar + "+1 başarılı gün" etiketi */
function Celebration({ burst }: { burst: number }) {
  return (
    <AnimatePresence>
      {burst > 0 && (
        <motion.div
          key={burst}
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        >
          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{ width: p.s, height: p.s, background: p.c, boxShadow: `0 0 10px ${p.c}`, marginLeft: -p.s / 2, marginTop: -p.s / 2 }}
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
              animate={{ x: p.x, y: p.y, scale: [0.4, 1.2, 0.6], opacity: [1, 1, 0] }}
              transition={{ duration: 1.1, ease: [0.15, 0.85, 0.25, 1] }}
            />
          ))}
          <motion.div
            className="absolute left-1/2 -top-1 -translate-x-1/2 chip !text-emerald !border-emerald/40 !bg-emerald/10 whitespace-nowrap"
            initial={{ y: 10, opacity: 0, scale: 0.8 }}
            animate={{ y: -6, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
          >
            Hedef vuruldu ✓
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
