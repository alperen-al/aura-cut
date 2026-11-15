import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useAura } from "../store/useAura";
import { Emblem } from "./Emblem";
import { Btn, Icon, SPRING, TONE_HEX } from "./ui";
import { ClawMarks } from "./UltraCard";

interface Page {
  kicker: string;
  title: string;
  body: ReactNode;
  art: ReactNode;
}

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="num inline-flex items-center h-5 px-1.5 mx-0.5 rounded-md border border-line bg-veil/[0.05] text-[10.5px] text-ink">
    {children}
  </kbd>
);
const Li = ({ children }: { children: ReactNode }) => (
  <li className="flex gap-2.5">
    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
    <span>{children}</span>
  </li>
);

/* ── Küçük illüstrasyonlar ─────────────────────────────── */
const ArtBox = ({ children }: { children: ReactNode }) => (
  <div className="relative h-full w-full grid place-items-center overflow-hidden">
    <ClawMarks className="absolute -right-8 -bottom-6 w-44 text-ink opacity-[0.05]" />
    {children}
  </div>
);

const MiniCard = ({ title, kcal, p, hot }: { title: string; kcal: number; p: number; hot?: boolean }) => (
  <div
    className={`w-44 rounded-2xl border p-3 bg-titanium ${hot ? "border-accent/40 shadow-[0_10px_30px_-12px_var(--accent-glow)]" : "border-line"}`}
  >
    <div className="flex items-center justify-between">
      <span className="text-[12px] font-semibold">{title}</span>
      <span className={`size-6 rounded-lg grid place-items-center ${hot ? "bg-accent text-on-accent" : "bg-veil/[0.05] text-ink-3"}`}>
        <Icon.plus size={12} />
      </span>
    </div>
    <div className="num text-[15px] font-semibold mt-2">
      {kcal} <span className="text-[10px] text-ink-3">kcal</span> <span className="text-cyan text-[12px]">{p}g P</span>
    </div>
  </div>
);

const RING_STATES = [
  { c: TONE_HEX.cyan, t: "Banda varmadın", d: "0 – 2000" },
  { c: TONE_HEX.emerald, t: "Hedef vuruldu", d: "2000 – 2200" },
  { c: TONE_HEX.amber, t: "Hedef üstü", d: "2200 – 3100" },
  { c: TONE_HEX.rose, t: "Telafi tetiklendi", d: "3100+" },
  { c: TONE_HEX.violet, t: "Serbest gün", d: "10. gün" },
];

const PAGES: Page[] = [
  {
    kicker: "Hoş geldin",
    title: "AURA CUT seni 80 kiloya taşıyacak",
    body: (
      <ul className="space-y-2">
        <Li>Günlük hedefin 2000–2200 kcal ve 150 g protein.</Li>
        <Li>Yediklerini gir; gerisini (açık, yağ kaybı, telafi, seri) uygulama hesaplar.</Li>
        <Li>
          Bu kılavuzu istediğin an üstteki <b>?</b> butonundan tekrar açabilirsin.
        </Li>
      </ul>
    ),
    art: (
      <ArtBox>
        {/* SVG parlama filtresi + dönüş animasyonu Chromium rasterlayıcısını kilitliyordu: filtresiz amblem + statik CSS hale */}
        <div className="absolute size-44 rounded-full bg-[radial-gradient(circle,rgb(16_185_129/0.28),transparent_65%)]" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <Emblem size={120} glow={false} />
        </motion.div>
      </ArtBox>
    ),
  },
  {
    kicker: "1 · Öğün eklemek",
    title: "Tek dokunuş, bitti",
    body: (
      <ul className="space-y-2">
        <Li>
          <b>Kahvaltı / Gün İçi / Akşam / Gece</b> sekmelerindeki karta dokun → günlüğe eklenir.
        </Li>
        <Li>
          Üstteki <b>Kombolar</b> tüm günü tek tuşla yükler (ör. Günün Kombosu = 2170 kcal).
        </Li>
        <Li>Kartın üzerine gelince "Eklersen toplam kaç olur" önizlemesi çıkar.</Li>
      </ul>
    ),
    art: (
      <ArtBox>
        <div className="space-y-2.5">
          <MiniCard title="Hafif Yüksek Protein" kcal={605} p={44} hot />
          <div className="translate-x-8">
            <MiniCard title="Tavuk & Fırın Patates" kcal={1375} p={100} />
          </div>
        </div>
      </ArtBox>
    ),
  },
  {
    kicker: "2 · Gram ile & Ekstra",
    title: "Ne yediysen, kaç gram yediysen",
    body: (
      <ul className="space-y-2">
        <Li>
          <b>Gram ile</b>: besini ara (tavuk but, pirinç, Banvit, Dost…), gramı yaz, <Kbd>Enter</Kbd>. Kalori + protein/karb/yağ anında
          hesaplanır.
        </Li>
        <Li>Gramajlar çiğ/kuru tartılır. Listede yoksa etiketteki 100 g değerleriyle kendin ekle.</Li>
        <Li>
          Diyet dışı bir şey mi? <b>Ekstra</b> sekmesine adını ve kalorisini yaz, yeter.
        </Li>
      </ul>
    ),
    art: (
      <ArtBox>
        <div className="w-56 rounded-2xl border border-line bg-titanium p-4 space-y-3">
          <div className="text-[12px] font-semibold">Tavuk göğsü (derisiz)</div>
          <div className="field num !h-11 !text-[20px] !font-semibold flex items-center">250 g</div>
          <div className="num text-[26px] font-semibold">
            300 <span className="text-[11px] text-ink-3">kcal</span>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
            <span className="bg-cyan" style={{ width: "77%" }} />
            <span className="bg-violet" style={{ width: "23%" }} />
          </div>
        </div>
      </ArtBox>
    ),
  },
  {
    kicker: "3 · Halkanın dili",
    title: "Renge bak, durumu anla",
    body: (
      <ul className="space-y-1.5">
        {RING_STATES.map((r) => (
          <li key={r.t} className="flex items-center gap-2.5">
            <span className="size-3 rounded-[4px]" style={{ background: r.c, boxShadow: `0 0 10px ${r.c}88` }} />
            <span className="font-semibold w-36">{r.t}</span>
            <span className="num text-ink-3 text-[11.5px]">{r.d} kcal</span>
          </li>
        ))}
      </ul>
    ),
    art: (
      <ArtBox>
        <svg width="190" height="190" viewBox="0 0 190 190">
          {RING_STATES.slice(0, 4).map((r, i) => (
            <circle
              key={r.t}
              cx="95"
              cy="95"
              r={78 - i * 17}
              fill="none"
              stroke={r.c}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${(0.85 - i * 0.12) * 2 * Math.PI * (78 - i * 17)} 999`}
              transform="rotate(-90 95 95)"
              style={{ filter: `drop-shadow(0 0 6px ${r.c}88)` }}
            />
          ))}
        </svg>
      </ArtBox>
    ),
  },
  {
    kicker: "4 · Akıllı kurallar",
    title: "Kaçamak yaptın? Sistem toparlar",
    body: (
      <ul className="space-y-2">
        <Li>
          Gün sonu <b>2000–2200</b> ise içinde pizza olsa bile gün başarılı.
        </Li>
        <Li>
          <b>3100+ kcal</b> → Telafi Protokolü: sonraki 2 gün hedef otomatik <b>1500–1600</b>, sonra normale döner.
        </Li>
        <Li>
          <b>10 günde bir</b> serbest öğün kilidi açılır. O gün tavan 3600 kcal.
        </Li>
      </ul>
    ),
    art: (
      <ArtBox>
        <div className="w-60 space-y-2">
          {[
            { d: "Cmt", k: 3240, c: TONE_HEX.rose, t: "Tetik" },
            { d: "Paz", k: 1560, c: TONE_HEX.amber, t: "Telafi 1/2" },
            { d: "Pzt", k: 1590, c: TONE_HEX.amber, t: "Telafi 2/2" },
            { d: "Sal", k: 2120, c: TONE_HEX.emerald, t: "Normal" },
          ].map((x) => (
            <div key={x.d} className="flex items-center gap-2 rounded-xl border border-line bg-titanium px-3 py-2">
              <span className="text-[11px] text-ink-3 w-7">{x.d}</span>
              <span className="h-1.5 rounded-full" style={{ width: x.k / 25, background: x.c }} />
              <span className="num text-[11px] ml-auto">{x.k}</span>
              <span className="text-[10px] font-semibold w-16 text-right" style={{ color: x.c }}>
                {x.t}
              </span>
            </div>
          ))}
        </div>
      </ArtBox>
    ),
  },
  {
    kicker: "5 · Düzeltmek",
    title: "Yanlış mı ekledin? Sorun değil",
    body: (
      <ul className="space-y-2">
        <Li>
          Günlükteki her satırda <b>×</b> ile sil; üzerine gelince adet <b>− / +</b> çıkar.
        </Li>
        <Li>
          Hepsini silmek için <b>Günü temizle</b> → "Emin misin? Sil".
        </Li>
        <Li>
          Her işlemden sonra çıkan <b>Geri al</b> ya da <Kbd>Ctrl</Kbd>+<Kbd>Z</Kbd>.
        </Li>
        <Li>
          Geçmiş bir günü düzeltmek için <Kbd>←</Kbd> <Kbd>→</Kbd>.
        </Li>
      </ul>
    ),
    art: (
      <ArtBox>
        <div className="w-60 rounded-2xl border border-line bg-titanium p-2 space-y-1">
          {["İçim Fit Kakaolu Süt", "Tavuk & Fırın Patates", "Hafif Yüksek Protein"].map((n, i) => (
            <div key={n} className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ${i === 1 ? "bg-rose/[0.08]" : ""}`}>
              <span className="text-[11.5px] flex-1 truncate">{n}</span>
              <span className={`size-6 rounded-md grid place-items-center ${i === 1 ? "text-rose bg-rose/10" : "text-ink-3"}`}>
                <Icon.x size={12} />
              </span>
            </div>
          ))}
        </div>
      </ArtBox>
    ),
  },
  {
    kicker: "6 · Tartı & Analiz",
    title: "Trendi gör, tarihi bil",
    body: (
      <ul className="space-y-2">
        <Li>
          <b>Tartı</b> sekmesi: sabah, tuvalet sonrası, aç karnına, kıyafetsiz tartıl.
        </Li>
        <Li>7 günlük hareketli ortalama dalgalanmayı yumuşatır; haftalık ortalamalar asıl ilerlemeyi gösterir.</Li>
        <Li>
          <b>Analiz</b>: 5 haftalık takvim, kalori ritmi ve 80 kg'a tahmini varış tarihi.
        </Li>
        <Li>
          <b>Motivasyon</b>: her gün farklı bir sporcu, sözü, videosu ve günün görev listesi.
        </Li>
      </ul>
    ),
    art: (
      <ArtBox>
        <svg width="230" height="130" viewBox="0 0 230 130">
          <path
            d="M10 30 C60 34 80 52 120 66 S190 96 220 104"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {[18, 40, 62, 84, 106, 128, 150, 172, 194, 216].map((x, i) => (
            <circle key={x} cx={x} cy={30 + i * 7.6 + (i % 2 ? 6 : -5)} r="3" fill="var(--color-ink-3)" />
          ))}
          <line x1="10" x2="220" y1="112" y2="112" stroke={TONE_HEX.emerald} strokeDasharray="4 4" />
          <text x="220" y="125" textAnchor="end" fontSize="10" fill={TONE_HEX.emerald}>
            hedef 80
          </text>
        </svg>
      </ArtBox>
    ),
  },
  {
    kicker: "7 · Arka planda",
    title: "Sessiz, hafif, hep hazır",
    body: (
      <ul className="space-y-2">
        <Li>
          Pencereyi <b>X</b> ile kapat → saatin yanındaki tepsiye iner, RAM'i boşaltır (~6 MB).
        </Li>
        <Li>Tepsi simgesine tıkla → anında açılır. Sağ tık → "Tamamen çık".</Li>
        <Li>Windows ile başlar; sabah tartı ve gece ZMA için bildirim gönderir.</Li>
        <Li>
          Kısayollar: <Kbd>1</Kbd>–<Kbd>4</Kbd> sekmeler · <Kbd>F1</Kbd> kılavuz · <Kbd>Esc</Kbd> kapat.
        </Li>
      </ul>
    ),
    art: (
      <ArtBox>
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-titanium px-4 py-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-5 rounded-md bg-veil/[0.06]" />
          ))}
          <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="ml-1">
            <Emblem size={26} />
          </motion.span>
          <span className="num text-[11px] text-ink-3 ml-2">01:30</span>
        </div>
      </ArtBox>
    ),
  },
];

export function Guide() {
  const open = useAura((s) => s.guideOpen);
  const setOpen = useAura((s) => s.setGuideOpen);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const last = i === PAGES.length - 1;

  const go = (n: number) => {
    const next = Math.max(0, Math.min(PAGES.length - 1, n));
    setDir(next > i ? 1 : -1);
    setI(next);
  };

  useEffect(() => {
    if (open) setI(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(i - 1);
      else if (e.key === "Escape") setOpen(false);
      else return;
      e.stopImmediatePropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  const page = PAGES[i];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-base/70" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: 24, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
            transition={SPRING}
            className="panel neon-edge relative w-[780px] max-w-full h-[460px] grid grid-cols-[300px_1fr] overflow-hidden"
            style={{ background: "var(--color-titanium)" }}
          >
            {/* Sol: illüstrasyon */}
            <div className="relative border-r border-line bg-veil/[0.025]">
              <AnimatePresence custom={dir} initial={false}>
                <motion.div
                  key={i}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -40 }}
                  transition={SPRING}
                  className="absolute inset-0"
                >
                  {page.art}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sağ: metin */}
            <div className="relative flex flex-col p-7 pb-5">
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 size-8 grid place-items-center rounded-lg text-ink-3 hover:text-ink hover:bg-veil/5"
                aria-label="Kapat"
              >
                <Icon.x />
              </button>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1"
                >
                  <div className="label">{page.kicker}</div>
                  <h2 className="text-[22px] font-semibold tracking-tight mt-2 mb-4 pr-8 leading-tight">{page.title}</h2>
                  <div className="text-[13px] leading-relaxed text-ink-2">{page.body}</div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-1.5">
                  {PAGES.map((_, n) => (
                    <button
                      key={n}
                      onClick={() => go(n)}
                      aria-label={`Sayfa ${n + 1}`}
                      className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-accent" : "w-1.5 bg-veil/15 hover:bg-veil/30"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="num text-[11px] text-ink-3 mr-1">
                    {i + 1}/{PAGES.length}
                  </span>
                  <Btn
                    onClick={() => go(i - 1)}
                    disabled={i === 0}
                    className="h-9 px-3 rounded-xl border border-line text-[12px] font-semibold text-ink-2 disabled:opacity-30"
                  >
                    Geri
                  </Btn>
                  <Btn
                    onClick={() => (last ? setOpen(false) : go(i + 1))}
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-accent to-accent-2 text-on-accent text-[12px] font-bold"
                  >
                    {last ? "Başlayalım" : "İleri"}
                  </Btn>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
