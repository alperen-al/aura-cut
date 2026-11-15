import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NOTES } from "../data/meals";
import { fmtLong, fmtShort } from "../lib/date";
import { useDerived } from "../lib/derived";
import { goalProgress, type WeightPoint } from "../lib/engine";
import { useAura } from "../store/useAura";
import { AnimatedNumber, Btn, Icon, PanelTitle, SOFT } from "./ui";

export function WeightView() {
  const { weights, weekly, proj } = useDerived();
  const s = useAura((st) => st.data.settings);
  const current = proj?.current ?? s.startWeight;
  const progress = goalProgress(s, current);

  return (
    <div className="grid grid-cols-[340px_1fr] gap-4 h-full min-h-0">
      <div className="scroll space-y-4 pr-1 pb-4">
        <WeighIn />

        <section className="panel neon-edge p-5">
          <PanelTitle icon={<Icon.target size={14} />}>Hedef Yolculuğu</PanelTitle>
          <div className="flex items-end justify-between">
            <div>
              <div className="label !text-[9.5px]">7 gün ort.</div>
              <div className="num text-[38px] font-semibold leading-none mt-1">
                <AnimatedNumber value={current} decimals={1} />
                <span className="text-[14px] text-ink-3 ml-1">kg</span>
              </div>
            </div>
            <div className="text-right">
              <div className="num text-[15px] font-semibold text-emerald">
                {current - s.startWeight <= 0 ? "−" : "+"}
                {Math.abs(current - s.startWeight).toFixed(1)} kg
              </div>
              <div className="text-[10.5px] text-ink-3">başlangıç {s.startWeight} kg</div>
            </div>
          </div>

          {/* 100 → 80 (75) ilerleme rayı */}
          <div className="mt-5">
            <div className="relative h-2.5 rounded-full bg-veil/[0.05]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-2 to-accent shadow-[0_0_14px_var(--accent-glow)]"
                initial={false}
                animate={{ width: `${progress * 100}%` }}
                transition={SOFT}
              />
            </div>
            <div className="flex justify-between num text-[10.5px] text-ink-3 mt-1.5">
              <span>{s.startWeight}</span>
              <span className="text-emerald">%{Math.round(progress * 100)}</span>
              <span>
                {s.goalMax} <span className="text-ink-3/60">/ {s.goalMin}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <Stat label="Kalan" value={`${(proj?.toGoal ?? 0).toFixed(1)}`} unit="kg" />
            <Stat label="BMI" value={(proj?.bmi ?? 0).toFixed(1)} />
            <Stat label="Boy" value={`${s.heightCm}`} unit="cm" />
          </div>

          <div className="mt-4 rounded-2xl border border-emerald/25 bg-emerald/[0.06] p-3.5">
            <div className="label !text-emerald/80 !text-[9.5px]">Tahmini varış · {s.goalMax} kg</div>
            {proj?.eta ? (
              <>
                <div className="text-[17px] font-semibold mt-1">{fmtLong(proj.eta)}</div>
                <div className="num text-[11px] text-ink-3 mt-0.5">≈ {proj.days} gün · mevcut ortalama açıkla</div>
              </>
            ) : (
              <div className="text-[12px] text-ink-2 mt-1">Birkaç gün kayıt girince ortalama açığından hesaplanır.</div>
            )}
          </div>
        </section>
      </div>

      <div className="scroll space-y-4 pr-1 pb-4 min-w-0">
        <section className="panel p-5">
          <PanelTitle
            right={
              <div className="flex items-center gap-3 text-[10.5px] text-ink-3">
                <Legend color="#10B981" label="7 gün hareketli ort." line />
                <Legend color="var(--color-ink-2)" label="günlük tartı" />
              </div>
            }
          >
            Kilo Trendi
          </PanelTitle>
          <WeightChart points={weights.slice(-60)} goal={s.goalMax} />
        </section>

        <section className="panel p-5">
          <PanelTitle>Haftalık Ortalamalar</PanelTitle>
          {weekly.length === 0 ? (
            <p className="text-[12px] text-ink-3 py-4">Henüz tartı kaydı yok.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
              {[...weekly]
                .reverse()
                .slice(0, 12)
                .map((w) => (
                  <div key={w.week} className="rounded-2xl bg-veil/[0.025] border border-line p-3">
                    <div className="text-[10.5px] text-ink-3">{fmtShort(w.week)} haftası</div>
                    <div className="num text-[20px] font-semibold mt-0.5">{w.avg.toFixed(1)}</div>
                    <div className="flex justify-between num text-[10.5px] mt-0.5">
                      <span className={w.delta === null ? "text-ink-3" : w.delta <= 0 ? "text-emerald" : "text-rose"}>
                        {w.delta === null ? "ilk hafta" : `${w.delta <= 0 ? "▼" : "▲"} ${Math.abs(w.delta).toFixed(2)}`}
                      </span>
                      <span className="text-ink-3">{w.count} tartı</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function WeighIn() {
  const selected = useAura((s) => s.selected);
  const today = useAura((s) => s.today);
  const existing = useAura((s) => s.data.days[s.selected]?.weight);
  const setWeight = useAura((s) => s.setWeight);
  const [val, setVal] = useState(existing?.toString() ?? "");
  useEffect(() => setVal(existing?.toString() ?? ""), [existing, selected]);
  const num = Number(val.replace(",", "."));
  const valid = num > 30 && num < 300;

  return (
    <section className="panel p-5">
      <PanelTitle
        icon={<Icon.scale size={14} />}
        right={<span className="text-[10.5px] text-ink-3">{selected === today ? "bugün" : fmtShort(selected)}</span>}
      >
        Tartı Girişi
      </PanelTitle>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) setWeight(Math.round(num * 10) / 10);
        }}
      >
        <div className="relative flex-1">
          <input
            className="field num !h-12 !text-[22px] !font-semibold pr-10"
            inputMode="decimal"
            placeholder="00.0"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-3">kg</span>
        </div>
        <Btn
          type="submit"
          disabled={!valid}
          className="h-12 px-5 rounded-xl bg-gradient-to-r from-accent to-accent-2 text-on-accent text-[12.5px] font-bold disabled:opacity-30"
        >
          Kaydet
        </Btn>
      </form>
      {existing !== undefined && (
        <button onClick={() => setWeight(undefined)} className="text-[10.5px] text-ink-3 hover:text-rose mt-2">
          bu günün kaydını sil
        </button>
      )}
      <div className="mt-3 flex gap-2.5 rounded-xl bg-cyan/[0.06] border border-cyan/20 p-3">
        <span className="text-cyan mt-0.5">
          <Icon.info size={14} />
        </span>
        <div>
          <div className="text-[11.5px] font-semibold text-cyan">Tartı protokolü</div>
          <div className="text-[11.5px] text-ink-2 leading-relaxed">{NOTES.weighIn}</div>
        </div>
      </div>
    </section>
  );
}

const Stat = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div className="rounded-xl bg-veil/[0.025] border border-line px-3 py-2">
    <div className="label !text-[9px] !tracking-[0.14em]">{label}</div>
    <div className="num text-[15px] font-semibold">
      {value}
      {unit && <span className="text-[10px] text-ink-3 ml-0.5">{unit}</span>}
    </div>
  </div>
);

const Legend = ({ color, label, line }: { color: string; label: string; line?: boolean }) => (
  <span className="flex items-center gap-1.5">
    <span className={line ? "w-3 h-[2px] rounded" : "size-1.5 rounded-full"} style={{ background: color }} />
    {label}
  </span>
);

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(600);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function WeightChart({ points, goal }: { points: WeightPoint[]; goal: number }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 260;
  const pad = { l: 40, r: 16, t: 14, b: 26 };

  if (points.length < 2) {
    return (
      <div ref={ref} className="h-[260px] grid place-items-center rounded-2xl border border-dashed border-line">
        <div className="text-center">
          <div className="text-[13px] text-ink-2">Trend için en az 2 tartı gerekli</div>
          <div className="text-[11px] text-ink-3 mt-1">Soldan bugünkü tartını gir.</div>
        </div>
      </div>
    );
  }

  const vals = points.flatMap((p) => [p.weight, p.avg7]);
  let lo = Math.floor(Math.min(...vals) - 1);
  let hi = Math.ceil(Math.max(...vals) + 1);
  if (hi - lo < 4) {
    lo -= 1;
    hi += 1;
  }
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * ih;

  // Yumuşak eğri (Catmull-Rom → Bezier)
  const pts = points.map((p, i) => [x(i), y(p.avg7)] as const);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  const area = `${d} L${pts[pts.length - 1][0]},${pad.t + ih} L${pts[0][0]},${pad.t + ih} Z`;
  const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);
  const labelEvery = Math.ceil(points.length / 6);
  const h = hover !== null ? points[hover] : null;

  return (
    <div ref={ref} className="relative">
      <svg
        width={W}
        height={H}
        className="block"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGElement).getBoundingClientRect();
          const i = Math.round(((e.clientX - r.left - pad.l) / iw) * (points.length - 1));
          setHover(Math.max(0, Math.min(points.length - 1, i)));
        }}
      >
        <defs>
          <linearGradient id="wl" x1="0" x2="1">
            <stop stopColor="#06B6D4" />
            <stop offset="1" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="wa" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#10B981" stopOpacity=".22" />
            <stop offset="1" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--color-veil)" strokeOpacity=".05" />
            <text x={pad.l - 8} y={y(t) + 3.5} textAnchor="end" className="num" fontSize="10" fill="var(--color-ink-3)">
              {t.toFixed(0)}
            </text>
          </g>
        ))}
        {goal >= lo && goal <= hi && (
          <g>
            <line x1={pad.l} x2={W - pad.r} y1={y(goal)} y2={y(goal)} stroke="#10B981" strokeOpacity=".5" strokeDasharray="4 4" />
            <text x={W - pad.r} y={y(goal) - 5} textAnchor="end" fontSize="10" fill="#10B981">
              hedef {goal}
            </text>
          </g>
        )}
        <motion.path d={area} fill="url(#wa)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <motion.path
          d={d}
          fill="none"
          stroke="url(#wl)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,.55))" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.2, 0.9, 0.1, 1] }}
        />
        {points.map((p, i) => (
          <circle
            key={p.date}
            cx={x(i)}
            cy={y(p.weight)}
            r={i === hover ? 4 : 2.4}
            fill={i === hover ? "var(--color-ink)" : "var(--color-ink-2)"}
            fillOpacity={i === hover ? 1 : 0.55}
          />
        ))}
        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text key={`l${p.date}`} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--color-ink-3)">
              {fmtShort(p.date)}
            </text>
          ) : null,
        )}
        {h && hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="var(--color-veil)" strokeOpacity=".12" />
        )}
      </svg>
      {h && hover !== null && (
        <div
          className="absolute top-2 pointer-events-none rounded-xl bg-base/95 border border-line px-3 py-2 text-[11px] shadow-xl"
          style={{ left: Math.min(Math.max(x(hover) - 70, 0), W - 140), width: 140 }}
        >
          <div className="text-ink-3">{fmtShort(h.date)}</div>
          <div className="num">
            Tartı <span className="text-ink font-semibold">{h.weight.toFixed(1)}</span>
          </div>
          <div className="num text-emerald">Ort. {h.avg7.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
