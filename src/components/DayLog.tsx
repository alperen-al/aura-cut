import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CATEGORY_LABEL } from "../data/meals";
import { fmtTime } from "../lib/date";
import { useDerived } from "../lib/derived";
import { useAura } from "../store/useAura";
import { Icon, PanelTitle, SPRING } from "./ui";
import type { Entry } from "../lib/types";

const NO_ENTRIES: Entry[] = [];

const CAT_COLOR: Record<string, string> = {
  kahvalti: "#F59E0B",
  "gun-ici": "#06B6D4",
  aksam: "#10B981",
  gece: "#818CF8",
  cheat: "#8B5CF6",
  ozel: "#22D3EE",
  ekstra: "#F59E0B",
};

export function DayLog() {
  const entries = useAura((s) => s.data.days[s.selected]?.entries ?? NO_ENTRIES);
  const setQty = useAura((s) => s.setQty);
  const remove = useAura((s) => s.removeEntry);
  const clearDay = useAura((s) => s.clearDay);
  const { selEval } = useDerived();
  const sorted = [...entries].sort((a, b) => a.at - b.at);
  const [confirming, setConfirming] = useState(false);

  // Onay 3 sn içinde verilmezse kendiliğinden kapanır
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);

  return (
    <section className="panel p-4">
      <PanelTitle
        right={
          <div className="flex items-center gap-2">
            <span className="num text-[11px] text-ink-3">
              {entries.length} kayıt · {selEval.protein}g P
            </span>
            {entries.length > 0 &&
              (confirming ? (
                <button
                  onClick={() => {
                    clearDay();
                    setConfirming(false);
                  }}
                  className="h-6 px-2 rounded-md bg-rose text-white text-[10.5px] font-bold"
                >
                  Emin misin? Sil
                </button>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  className="h-6 px-2 rounded-md border border-line text-[10.5px] font-semibold text-ink-3 hover:text-rose hover:border-rose/40 transition-colors"
                  title="Bu günün tüm kayıtlarını sil"
                >
                  Günü temizle
                </button>
              ))}
          </div>
        }
      >
        Günlük
      </PanelTitle>

      {sorted.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto size-10 rounded-2xl grid place-items-center bg-veil/[0.03] text-ink-3 mb-2">
            <Icon.plus />
          </div>
          <p className="text-[12px] text-ink-3">Kütüphaneden bir öğüne dokun ya da tek tuş kombo yükle.</p>
        </div>
      ) : (
        <ul className="relative space-y-1.5">
          <span
            aria-hidden
            className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald/40 via-cyan/20 to-transparent"
          />
          <AnimatePresence initial={false}>
            {sorted.map((e) => {
              const col = e.cheat ? CAT_COLOR.cheat : CAT_COLOR[e.category];
              return (
                <motion.li
                  key={e.uid}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12, height: 0, marginTop: 0 }}
                  transition={SPRING}
                  className="group relative pl-6"
                >
                  <span
                    className="absolute left-[3px] top-[14px] size-[9px] rounded-full border-2 border-base"
                    style={{ background: col, boxShadow: `0 0 8px ${col}` }}
                  />
                  <div className="flex items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-veil/[0.03] transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12.5px] font-medium truncate">{e.name}</span>
                        {e.cheat && <span className="text-[9px] font-bold px-1.5 rounded bg-violet/20 text-violet">SERBEST</span>}
                      </div>
                      <div className="num text-[10.5px] text-ink-3 truncate">
                        {fmtTime(e.at)} · {e.grams ? e.detail : CATEGORY_LABEL[e.category]} · {Math.round(e.protein * e.qty)}g P
                        {e.qty !== 1 && <span className="text-cyan"> · ×{e.qty}</span>}
                      </div>
                    </div>
                    {/* Adet ayarı üzerine gelince; kcal ve sil her zaman görünür */}
                    <div className="flex items-center rounded-lg bg-base/70 border border-line opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setQty(e.uid, e.qty - 0.5)}
                        className="size-6 grid place-items-center text-ink-3 hover:text-ink"
                        aria-label="Azalt"
                      >
                        <Icon.minus size={12} />
                      </button>
                      <span className="num text-[10.5px] w-8 text-center">×{e.qty}</span>
                      <button
                        onClick={() => setQty(e.uid, e.qty + 0.5)}
                        className="size-6 grid place-items-center text-ink-3 hover:text-ink"
                        aria-label="Artır"
                      >
                        <Icon.plus size={12} />
                      </button>
                    </div>
                    <span className="num text-[13px] font-semibold w-11 text-right shrink-0">{Math.round(e.kcal * e.qty)}</span>
                    <button
                      onClick={() => remove(e.uid)}
                      className="size-7 shrink-0 grid place-items-center rounded-lg text-ink-3 hover:text-rose hover:bg-rose/10 transition-colors"
                      aria-label="Sil"
                      title="Sil"
                    >
                      <Icon.x size={14} />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
