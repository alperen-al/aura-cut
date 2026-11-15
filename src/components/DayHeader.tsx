import { AnimatePresence, motion } from "motion/react";
import { ATHLETES, athleteIndexFor } from "../data/athletes";
import { fmtLong } from "../lib/date";
import { useDerived } from "../lib/derived";
import { useAura } from "../store/useAura";
import { Btn, Icon, SPRING, STATUS_LABEL, TONE_HEX, statusTone } from "./ui";

export function DayHeader() {
  const selected = useAura((s) => s.selected);
  const today = useAura((s) => s.today);
  const shift = useAura((s) => s.shiftDate);
  const select = useAura((s) => s.selectDate);
  const day = useAura((s) => s.data.days[s.selected]);
  const toggleTrained = useAura((s) => s.toggleTrained);
  const settings = useAura((s) => s.data.settings);
  const { selEval, evals } = useDerived();
  const isToday = selected === today;
  const tone = statusTone(selEval.status);
  const trained = !!day?.trained;

  // Bugün tetiklendiyse yarının telafi olduğunu önceden göster
  const tomorrow = [...evals.values()].find((e) => e.date > today);
  const incoming = isToday && selEval.status === "trigger" && tomorrow?.mode === "telafi";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Btn
            onClick={() => shift(-1)}
            className="size-8 grid place-items-center rounded-lg text-ink-2 hover:bg-veil/5"
            title="Önceki gün (←)"
          >
            <Icon.left />
          </Btn>
          <Btn
            onClick={() => shift(1)}
            disabled={isToday}
            className="size-8 grid place-items-center rounded-lg text-ink-2 hover:bg-veil/5 disabled:opacity-25 disabled:pointer-events-none"
            title="Sonraki gün (→)"
          >
            <Icon.right />
          </Btn>
        </div>
        <div className="min-w-0">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h1
              key={selected}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={SPRING}
              className="text-[19px] font-semibold tracking-tight truncate"
            >
              {fmtLong(selected)}
            </motion.h1>
          </AnimatePresence>
          <div className="text-[11px] text-ink-3 flex items-center gap-2">
            <span className="size-1.5 rounded-full" style={{ background: TONE_HEX[tone], boxShadow: `0 0 8px ${TONE_HEX[tone]}` }} />
            {isToday ? "Bugün" : "Geçmiş gün düzenleniyor"} · {STATUS_LABEL[selEval.status]}
          </div>
        </div>
        {!isToday && (
          <Btn onClick={() => select(today)} className="chip !text-cyan !border-cyan/30 hover:!bg-cyan/10">
            Bugüne dön
          </Btn>
        )}

        <div className="flex-1" />

        <Btn
          onClick={toggleTrained}
          className={`chip !h-8 !px-3 transition-colors ${trained ? "!text-emerald !border-emerald/40 !bg-emerald/10" : "hover:!text-ink"}`}
          title={`Antrenman günü harcama ${settings.tdeeTraining} kcal, dinlenme ${settings.tdeeRest} kcal`}
        >
          <Icon.dumbbell size={14} />
          {trained ? "Antrenman günü" : "Dinlenme günü"}
          <span className="num text-ink-3">{trained ? settings.tdeeTraining : settings.tdeeRest}</span>
        </Btn>
      </div>

      <DailyQuote />

      <AnimatePresence initial={false}>
        {(selEval.mode !== "normal" || incoming) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <ProtocolBanner
              mode={incoming ? "incoming" : selEval.mode}
              idx={selEval.compIndex}
              total={settings.compDays}
              band={`${settings.compMin}–${settings.compMax}`}
              cap={settings.cheatCap}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProtocolBanner({ mode, idx, total, band, cap }: { mode: string; idx?: number; total: number; band: string; cap: number }) {
  const cfg =
    mode === "serbest"
      ? { c: "#8B5CF6", t: "SERBEST GÜN", d: `10 günlük döngünün ödülü. Tavan ${cap} kcal; aşılmadıkça telafi tetiklenmez.` }
      : mode === "incoming"
        ? {
            c: "#F43F5E",
            t: "TELAFİ PROTOKOLÜ YARIN BAŞLIYOR",
            d: `Bugün hedefin +1000 kcal üzerine çıkıldı. Sonraki ${total} gün hedef ${band} kcal.`,
          }
        : {
            c: "#F59E0B",
            t: `TELAFİ PROTOKOLÜ · GÜN ${idx}/${total}`,
            d: `Hedef dinamik olarak ${band} kcal bandına çekildi. Protokol bitince 2000–2200'e otomatik dönüş.`,
          };
  return (
    <div
      className="relative rounded-2xl px-4 py-3 flex items-center gap-3 border overflow-hidden"
      style={{ borderColor: `${cfg.c}55`, background: `linear-gradient(90deg, ${cfg.c}1f, transparent 70%)` }}
    >
      <div className="size-8 rounded-xl grid place-items-center shrink-0" style={{ background: `${cfg.c}22`, color: cfg.c }}>
        {mode === "serbest" ? <Icon.spark /> : <Icon.bolt />}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold tracking-[0.16em]" style={{ color: cfg.c }}>
          {cfg.t}
        </div>
        <div className="text-[12px] text-ink-2 truncate">{cfg.d}</div>
      </div>
    </div>
  );
}

/** Günün sözü — tıklayınca Motivasyon sekmesi */
function DailyQuote() {
  const today = useAura((s) => s.today);
  const setView = useAura((s) => s.setView);
  const a = ATHLETES[athleteIndexFor(today)];
  return (
    <motion.button
      onClick={() => setView("motivation")}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      transition={SPRING}
      className="flex items-center gap-2 max-w-full w-fit h-8 px-3 rounded-full border border-line bg-veil/[0.025] hover:border-accent/30 text-left"
      title={`${a.quote} — ${a.name}`}
    >
      <span className="aura-flicker text-amber">
        <Icon.spark size={13} />
      </span>
      <span className="text-[11.5px] text-ink-2 truncate italic">“{a.quote}”</span>
      <span className="text-[10.5px] text-ink-3 whitespace-nowrap">— {a.name.split(" ").slice(-1)[0]}</span>
    </motion.button>
  );
}
