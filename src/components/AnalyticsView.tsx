import { motion } from "motion/react";
import { addDays, fmtDow, fmtShort, range, weekStart } from "../lib/date";
import { useDerived } from "../lib/derived";
import type { DayEval } from "../lib/engine";
import { useAura } from "../store/useAura";
import { Icon, PanelTitle, SOFT, STATUS_LABEL, TONE_HEX, statusTone } from "./ui";

export function AnalyticsView() {
  const { evals, streak, deficit } = useDerived();
  const today = useAura((s) => s.today);
  const s = useAura((st) => st.data.settings);

  const last30 = range(addDays(today, -29), today)
    .map((d) => evals.get(d))
    .filter((e): e is DayEval => !!e && e.hasEntries);
  const success = last30.filter((e) => e.status === "success" || e.status === "free").length;
  const avgKcal = last30.length ? Math.round(last30.reduce((a, e) => a + e.kcal, 0) / last30.length) : 0;
  const avgProt = last30.length ? Math.round(last30.reduce((a, e) => a + e.protein, 0) / last30.length) : 0;
  const protHit = last30.filter((e) => e.protein >= s.proteinTarget).length;
  const triggers = last30.filter((e) => e.status === "trigger").length;
  const totalFat = deficit.series.reduce((a, d) => a + (d.deficit ?? 0), 0) / 7700;

  return (
    <div className="scroll h-full pr-1 pb-4 space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <Kpi label="Ardışık seri" value={`${streak}`} unit="gün" tone="#10B981" icon={<Icon.flame size={14} />} />
        <Kpi
          label="Başarı oranı · 30g"
          value={last30.length ? `%${Math.round((success / last30.length) * 100)}` : "—"}
          sub={`${success}/${last30.length} gün`}
          tone="#06B6D4"
        />
        <Kpi
          label="Ort. kalori"
          value={avgKcal ? avgKcal.toLocaleString("tr-TR") : "—"}
          unit="kcal"
          sub={`hedef ${s.kcalMin}–${s.kcalMax}`}
          tone="var(--color-ink)"
        />
        <Kpi
          label="Ort. protein"
          value={avgProt ? `${avgProt}` : "—"}
          unit="g"
          sub={`${protHit} gün ≥ ${s.proteinTarget}g`}
          tone="#22D3EE"
        />
        <Kpi label="Yağ · 14 gün" value={totalFat.toFixed(2)} unit="kg" sub={`${triggers} telafi tetiği`} tone="#34D399" />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-4 items-start">
        <Heatmap />
        <KcalChart />
      </div>

      <section className="panel p-5 grid grid-cols-[auto_1fr] gap-x-10 items-start">
        <div>
          <PanelTitle>Durum Açıklaması</PanelTitle>
          <div className="space-y-2.5">
            {(["success", "under", "over", "trigger", "free"] as const).map((st) => (
              <div key={st} className="flex items-center gap-3">
                <span
                  className="size-3.5 rounded-[5px]"
                  style={{
                    background: TONE_HEX[statusTone(st)],
                    boxShadow: `0 0 10px ${TONE_HEX[statusTone(st)]}88`,
                  }}
                />
                <span className="text-[12.5px] font-medium w-32">{STATUS_LABEL[st]}</span>
                <span className="text-[11.5px] text-ink-3">
                  {st === "success" && `${s.kcalMin}–${s.kcalMax} kcal (telafide ${s.compMin}–${s.compMax})`}
                  {st === "under" && `Bandın altı — açık derin`}
                  {st === "over" && `Bandın üstü, ${s.kcalTarget + s.triggerOver} kcal altı`}
                  {st === "trigger" && `${s.kcalTarget + s.triggerOver}+ kcal → ${s.compDays} gün telafi`}
                  {st === "free" && `10. gün serbest öğün, ≤ ${s.cheatCap} kcal`}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="self-center rounded-2xl bg-veil/[0.025] border border-line p-3.5 text-[11.5px] text-ink-2 leading-relaxed">
          <span className="text-emerald font-semibold">Esnek diyet:</span> Gün sonu toplamı bandın içindeyse içinde pizza ya da çikolata
          olsa bile gün başarılı sayılır. Önemli olan haftalık açığın sürmesi.
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
  tone,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  tone: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SOFT} className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="label !text-[9.5px] !tracking-[0.14em]">{label}</span>
        <span style={{ color: tone }}>{icon}</span>
      </div>
      <div className="num text-[26px] font-semibold mt-1.5 leading-none" style={{ color: tone }}>
        {value}
        {unit && <span className="text-[12px] text-ink-3 ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-[10.5px] text-ink-3 mt-1.5">{sub}</div>}
    </motion.div>
  );
}

function Heatmap() {
  const { evals } = useDerived();
  const today = useAura((s) => s.today);
  const select = useAura((s) => s.selectDate);
  const setView = useAura((s) => s.setView);
  const start = addDays(weekStart(today), -28); // 5 hafta, Pazartesi başlangıç
  const days = range(start, addDays(weekStart(today), 6));

  return (
    <section className="panel p-5">
      <PanelTitle right={<span className="text-[10.5px] text-ink-3">güne git → tıkla</span>}>Son 5 Hafta</PanelTitle>
      <div className="grid grid-cols-7 gap-1.5">
        {days.slice(0, 7).map((d) => (
          <div key={d} className="text-[10px] text-ink-3 text-center pb-1">
            {fmtDow(d)}
          </div>
        ))}
        {days.map((d, i) => {
          const e = evals.get(d);
          const future = d > today;
          const st = e?.status ?? "empty";
          const col = TONE_HEX[statusTone(st)];
          const lit = !!e?.hasEntries;
          return (
            <motion.button
              key={d}
              disabled={future}
              onClick={() => {
                select(d);
                setView("today");
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: future ? 0.25 : 1, scale: 1 }}
              transition={{ ...SOFT, delay: i * 0.008 }}
              whileHover={future ? undefined : { scale: 1.08 }}
              className={`relative h-11 rounded-lg border text-[10px] num grid place-items-center ${d === today ? "ring-1 ring-cyan" : ""}`}
              style={{
                background: lit ? `${col}2e` : "color-mix(in srgb, var(--color-veil) 3%, transparent)",
                borderColor: lit ? `${col}66` : "color-mix(in srgb, var(--color-veil) 6%, transparent)",
                color: lit ? col : "var(--color-ink-3)",
                boxShadow: lit && st === "success" ? `0 0 12px -2px ${col}77` : undefined,
              }}
              title={e ? `${fmtShort(d)} · ${e.kcal} kcal · ${STATUS_LABEL[st]}${e.mode === "telafi" ? " · telafi" : ""}` : fmtShort(d)}
            >
              {Number(d.slice(8))}
              {e?.mode === "telafi" && <span className="absolute top-1 right-1 size-1 rounded-full bg-amber" />}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function KcalChart() {
  const { evals } = useDerived();
  const today = useAura((s) => s.today);
  const s = useAura((st) => st.data.settings);
  const days = range(addDays(today, -13), today).map((d) => evals.get(d)!);
  const top = Math.max(s.kcalTarget + s.triggerOver, ...days.map((e) => e?.kcal ?? 0)) * 1.05;
  const pct = (v: number) => `${(v / top) * 100}%`;

  return (
    <section className="panel p-5">
      <PanelTitle right={<span className="text-[10.5px] text-ink-3">son 14 gün · yeşil bant = hedef</span>}>Kalori Ritmi</PanelTitle>
      <div className="relative h-52">
        <div
          className="absolute inset-x-0 rounded bg-emerald/[0.07] border-y border-emerald/25"
          style={{
            bottom: pct(s.kcalMin),
            height: `calc(${pct(s.kcalMax)} - ${pct(s.kcalMin)})`,
          }}
        />
        <div className="absolute inset-x-0 border-t border-dashed border-rose/40" style={{ bottom: pct(s.kcalTarget + s.triggerOver) }}>
          <span className="absolute right-0 -top-4 text-[9.5px] text-rose/80 num">{s.kcalTarget + s.triggerOver} telafi eşiği</span>
        </div>
        <div className="absolute inset-0 flex items-end gap-2">
          {days.map((e) => {
            const col = TONE_HEX[statusTone(e.status)];
            return (
              <div key={e.date} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                <span className="num text-[9.5px] text-ink-3 opacity-0 group-hover:opacity-100 mb-1">{e.kcal || ""}</span>
                <motion.div
                  className="w-full max-w-[34px] rounded-t-md"
                  style={{
                    background: `linear-gradient(180deg, ${col}, ${col}44)`,
                    boxShadow: e.kcal ? `0 0 14px -4px ${col}` : undefined,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: pct(e.kcal) }}
                  transition={SOFT}
                />
                {e.mode === "telafi" && <span className="absolute -bottom-0.5 size-1 rounded-full bg-amber" />}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        {days.map((e) => (
          <div key={e.date} className="flex-1 text-center text-[9.5px] text-ink-3">
            {fmtShort(e.date).split(" ")[0]}
            <div>{fmtDow(e.date)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
