import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { ATHLETES, athleteIndexFor, type Athlete } from "../data/athletes";
import { addDays, fmtDow, fmtLong, fmtShort } from "../lib/date";
import { useDerived } from "../lib/derived";
import { isTauri } from "../lib/storage";
import { fetchWiki, type WikiSummary } from "../lib/wiki";
import { useAura } from "../store/useAura";
import { Btn, Icon, PanelTitle, SOFT, SPRING } from "./ui";
import { ClawMarks } from "./UltraCard";

const HEX = "polygon(50% 0, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)";

const openExternal = (url: string) => {
  if (isTauri) void openUrl(url);
  else window.open(url, "_blank", "noopener");
};

/** Günün sporcusunu Wikipedia'dan çeker; çevrimdışıysa null döner, arayüz yine çalışır */
function useWiki(title: string) {
  const [state, setState] = useState<{ title: string; data: WikiSummary | null; loading: boolean }>({ title, data: null, loading: true });
  useEffect(() => {
    const ctl = new AbortController();
    setState({ title, data: null, loading: true });
    fetchWiki(title, ctl.signal)
      .then((data) => setState({ title, data, loading: false }))
      .catch(() => !ctl.signal.aborted && setState({ title, data: null, loading: false }));
    return () => ctl.abort();
  }, [title]);
  return state.title === title ? state : { title, data: null, loading: true };
}

export function MotivationView() {
  const today = useAura((s) => s.today);
  const [offset, setOffset] = useState(0);
  const idx = (athleteIndexFor(today) + offset + ATHLETES.length * 10) % ATHLETES.length;
  const athlete = ATHLETES[idx];
  const wiki = useWiki(athlete.wiki);

  return (
    <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-4 h-full min-h-0">
      <div className="scroll pr-1 pb-4">
        <Hero
          athlete={athlete}
          wiki={wiki.data}
          loading={wiki.loading}
          isToday={offset === 0}
          onNext={() => setOffset((o) => o + 1)}
          onToday={() => setOffset(0)}
        />
      </div>
      <div className="scroll space-y-4 pr-1 pb-4">
        <MissionCard athlete={athlete} />
        <AboutCard wiki={wiki.data} loading={wiki.loading} />
        <WeekStrip today={today} />
      </div>
    </div>
  );
}

function Hero({
  athlete,
  wiki,
  loading,
  isToday,
  onNext,
  onToday,
}: {
  athlete: Athlete;
  wiki: WikiSummary | null;
  loading: boolean;
  isToday: boolean;
  onNext: () => void;
  onToday: () => void;
}) {
  const today = useAura((s) => s.today);
  const words = useMemo(() => athlete.quote.split(" "), [athlete.quote]);
  const [imgOk, setImgOk] = useState(false);
  useEffect(() => setImgOk(false), [wiki?.image]);

  return (
    <section className="panel neon-edge relative overflow-hidden min-h-full p-8 flex flex-col">
      {/* Bulanık fotoğraf zemini */}
      <AnimatePresence>
        {wiki?.image && imgOk && (
          <motion.div
            key={wiki.image}
            className="absolute inset-0 bg-cover bg-center scale-125 blur-2xl pointer-events-none"
            style={{ backgroundImage: `url("${wiki.image}")` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--panel-b)] pointer-events-none" />
      <ClawMarks className="absolute -right-6 top-6 w-56 text-ink opacity-[0.05] pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <span className="label">{isToday ? `Günün sporcusu · ${fmtShort(today)}` : "Keşif modu"}</span>
        <div className="flex gap-2">
          {!isToday && (
            <Btn onClick={onToday} className="chip !h-8 hover:!text-ink">
              Bugünün sporcusu
            </Btn>
          )}
          <Btn onClick={onNext} className="chip !h-8 hover:!text-ink" title="Başka bir sporcu göster">
            <motion.span whileHover={{ rotate: 180 }} transition={SPRING} className="inline-flex">
              <Icon.undo size={13} />
            </motion.span>
            Başka sporcu
          </Btn>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={athlete.id}
          className="relative flex-1 flex flex-col"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={SOFT}
        >
          <div className="flex items-center gap-7 mt-6">
            {/* Altıgen fotoğraf + dönen ışık halkası */}
            <div className="relative size-[176px] shrink-0 grid place-items-center">
              <div className="absolute inset-0 rounded-full aura-spin opacity-70" />
              <div className="absolute inset-[10px] rounded-full bg-titanium" />
              <motion.div
                className="relative size-[148px] bg-veil/[0.06] grid place-items-center overflow-hidden"
                style={{ clipPath: HEX }}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
              >
                {wiki?.image ? (
                  <motion.img
                    src={wiki.image}
                    alt={athlete.name}
                    referrerPolicy="no-referrer"
                    onLoad={() => setImgOk(true)}
                    onError={() => setImgOk(false)}
                    className="size-full object-cover object-top"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: imgOk ? 1 : 0, scale: imgOk ? 1 : 1.08 }}
                    transition={{ duration: 0.6 }}
                  />
                ) : (
                  <span className="text-[44px] font-bold text-ink-3">
                    {loading ? (
                      <span className="aura-pulse inline-block size-3 rounded-full bg-ink-3" />
                    ) : (
                      athlete.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                    )}
                  </span>
                )}
              </motion.div>
            </div>
            <div className="min-w-0">
              <span className="chip">{athlete.sport}</span>
              <h1 className="text-[40px] leading-[1.05] font-semibold tracking-tight mt-3">{athlete.name}</h1>
              <div className="text-[12px] text-ink-3 mt-2">{fmtLong(today)}</div>
            </div>
          </div>

          {/* Söz: kelime kelime belirir */}
          <blockquote className="relative mt-9 flex-1">
            <span className="absolute -left-2 -top-8 text-[96px] leading-none font-bold text-accent opacity-10 select-none">“</span>
            <p className="relative text-[25px] leading-[1.35] font-medium tracking-tight">
              {words.map((w, i) => (
                <motion.span
                  key={`${athlete.id}-${i}`}
                  className="inline-block mr-[0.28em]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.045, type: "spring", stiffness: 300, damping: 24 }}
                >
                  {w}
                </motion.span>
              ))}
            </p>
            <motion.p
              className="text-[12.5px] italic text-ink-3 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + words.length * 0.045 }}
            >
              “{athlete.original}” — {athlete.name}
            </motion.p>
          </blockquote>

          <div className="flex flex-wrap gap-2.5 mt-8">
            <Btn
              onClick={() => openExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(athlete.video)}`)}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-accent to-accent-2 text-on-accent text-[13px] font-bold flex items-center gap-2 shadow-[0_10px_28px_-10px_var(--accent-glow)]"
            >
              <PlayIcon /> Videoyu izle
            </Btn>
            {wiki && (
              <Btn
                onClick={() => openExternal(wiki.url)}
                className="h-11 px-4 rounded-xl border border-line text-[12.5px] font-semibold text-ink-2 hover:text-ink"
              >
                Wikipedia'da oku
              </Btn>
            )}
          </div>
          <p className="text-[10.5px] text-ink-3 mt-3">
            Video YouTube'da, varsayılan tarayıcında açılır. Sözler sporcuya atfedilen kısa alıntılardır.
          </p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function MissionCard({ athlete }: { athlete: Athlete }) {
  const { todayEval } = useDerived();
  const s = useAura((st) => st.data.settings);
  const day = useAura((st) => st.data.days[st.today]);
  const checks = [
    {
      label: `Kalori bandı (${todayEval.band.min}–${todayEval.band.max})`,
      ok: todayEval.status === "success" || todayEval.status === "free",
    },
    { label: `Protein ${s.proteinTarget} g`, ok: todayEval.protein >= s.proteinTarget },
    { label: "Sabah tartısı", ok: typeof day?.weight === "number" },
    { label: "Takviyeler (D3K2 · Omega 3 · ZMA)", ok: !!(day?.supps.d3k2 && day?.supps.omega3 && day?.supps.zma) },
    { label: `Su ${(s.waterTargetMl / 1000).toFixed(1)} L`, ok: (day?.waterMl ?? 0) >= s.waterTargetMl },
  ];
  const done = checks.filter((c) => c.ok).length;

  return (
    <section className="panel p-5 overflow-hidden">
      <PanelTitle icon={<Icon.target size={14} />} right={<span className="num text-[11px] text-ink-3">{done}/5</span>}>
        Bugünün görevi
      </PanelTitle>
      <AnimatePresence mode="wait">
        <motion.p
          key={athlete.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="text-[15px] font-semibold leading-snug"
        >
          {athlete.mission}
        </motion.p>
      </AnimatePresence>
      <ul className="mt-4 space-y-2">
        {checks.map((c, i) => (
          <motion.li
            key={c.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="flex items-center gap-2.5 text-[12.5px]"
          >
            <span
              className={`size-5 rounded-md grid place-items-center border transition-colors ${
                c.ok ? "bg-emerald border-emerald text-white" : "border-line text-transparent"
              }`}
            >
              <Icon.check size={12} />
            </span>
            <span className={c.ok ? "text-ink-2 line-through decoration-emerald/50" : ""}>{c.label}</span>
          </motion.li>
        ))}
      </ul>
      <div className="mt-4 h-1.5 rounded-full bg-veil/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-2 to-accent"
          initial={false}
          animate={{ width: `${(done / 5) * 100}%` }}
          transition={SOFT}
        />
      </div>
    </section>
  );
}

function AboutCard({ wiki, loading }: { wiki: WikiSummary | null; loading: boolean }) {
  return (
    <section className="panel p-5">
      <PanelTitle right={wiki && <span className="text-[10.5px] text-ink-3">kaynak: Wikipedia ({wiki.lang.toUpperCase()})</span>}>
        Hakkında
      </PanelTitle>
      {loading ? (
        <div className="space-y-2">
          {[92, 100, 78, 85].map((w, i) => (
            <div key={i} className="h-3 rounded bg-veil/[0.06] aura-pulse" style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
      ) : wiki ? (
        <p className="text-[12.5px] leading-relaxed text-ink-2 line-clamp-[9]">{wiki.extract}</p>
      ) : (
        <p className="text-[12px] text-ink-3">İnternet bağlantısı yok gibi görünüyor — fotoğraf ve biyografi bağlanınca gelir.</p>
      )}
    </section>
  );
}

function WeekStrip({ today }: { today: string }) {
  const days = Array.from({ length: 6 }, (_, i) => addDays(today, i + 1));
  return (
    <section className="panel p-5">
      <PanelTitle>Sıradaki günler</PanelTitle>
      <div className="grid grid-cols-3 gap-2">
        {days.map((d, i) => {
          const a = ATHLETES[athleteIndexFor(d)];
          return (
            <motion.div
              key={d}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, ...SPRING }}
              whileHover={{ y: -3 }}
              className="rounded-xl border border-line bg-veil/[0.025] p-2.5"
            >
              <div className="text-[10px] text-ink-3">
                {fmtDow(d)} · {fmtShort(d)}
              </div>
              <div className="text-[12px] font-semibold truncate mt-0.5">{a.name}</div>
              <div className="text-[10.5px] text-ink-3 truncate">{a.sport}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
  </svg>
);
