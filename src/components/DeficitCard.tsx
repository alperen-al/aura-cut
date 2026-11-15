import { motion } from "motion/react";
import { fmtDow } from "../lib/date";
import { useDerived } from "../lib/derived";
import { KCAL_PER_KG_FAT } from "../lib/engine";
import { AnimatedNumber, Icon, PanelTitle, SOFT } from "./ui";

/** Dinamik açık & yağ kaybı motoru: (TDEE − alınan), haftalık kümülatif, ÷ 7700 */
export function DeficitCard() {
  const { deficit } = useDerived();
  const last7 = deficit.series.slice(-7);
  const peak = Math.max(1200, ...last7.map((d) => Math.abs(d.deficit ?? 0)));

  return (
    <section className="panel p-4">
      <PanelTitle icon={<Icon.flame size={14} />} right={<span className="num text-[10.5px] text-ink-3">son 7 gün</span>}>
        Yağ Yakım Motoru
      </PanelTitle>

      <div className="flex items-end justify-between">
        <div>
          <div className={`num text-[30px] font-semibold leading-none ${deficit.week < 0 ? "text-rose" : "text-emerald"}`}>
            <AnimatedNumber value={deficit.weekFatKg} decimals={2} />
            <span className="text-[13px] text-ink-3 ml-1">kg yağ</span>
          </div>
          <div className="num text-[11px] text-ink-3 mt-1.5">
            Σ açık <span className="text-ink-2">{Math.round(deficit.week).toLocaleString("tr-TR")}</span> kcal ÷ {KCAL_PER_KG_FAT}
          </div>
        </div>
        <div className="text-right">
          <div className="label !text-[9.5px]">Günlük ort.</div>
          <div className="num text-[15px] font-semibold">{deficit.avgDaily ? Math.round(deficit.avgDaily) : "—"}</div>
        </div>
      </div>

      {/* 7 günlük açık sütunları: sıfır çizgisi ortada, fazla (negatif) aşağı */}
      <div className="relative mt-4 h-20 flex items-stretch gap-1.5">
        <span aria-hidden className="absolute left-0 right-0 top-1/2 h-px bg-veil/10" />
        {last7.map((d) => {
          const v = d.deficit;
          const h = v === null ? 0 : (Math.abs(v) / peak) * 50;
          const pos = (v ?? 0) >= 0;
          return (
            <div key={d.date} className="relative flex-1 flex flex-col items-center" title={v === null ? "Kayıt yok" : `${v} kcal`}>
              <div className="relative flex-1 w-full">
                <motion.div
                  className={`absolute left-1/2 -translate-x-1/2 w-full max-w-[18px] rounded-[4px] ${pos ? "bg-gradient-to-t from-emerald/40 to-emerald" : "bg-gradient-to-b from-rose/40 to-rose"}`}
                  style={pos ? { bottom: "50%" } : { top: "50%" }}
                  initial={false}
                  animate={{ height: `${h}%` }}
                  transition={SOFT}
                />
                {v === null && (
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-1 rounded-full bg-veil/20" />
                )}
              </div>
              <span className="text-[9.5px] text-ink-3 mt-1">{fmtDow(d.date)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
