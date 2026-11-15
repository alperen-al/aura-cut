import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { FOOD_DB, GROUP_LABEL, SOURCE_LABEL, macrosFor, searchFoods, type DbFood, type DbGroup, type DbSource } from "../data/foodDb";
import { useAura } from "../store/useAura";
import { AnimatedNumber, Btn, Icon, SPRING } from "./ui";

const GROUPS: (DbGroup | "all")[] = ["all", "tavuk", "et", "balik", "sut", "karb", "meyve", "yag", "disari", "benim"];
const GROUP_SHORT: Record<DbGroup | "all", string> = {
  all: "Tümü",
  tavuk: "Tavuk",
  et: "Et",
  balik: "Balık",
  sut: "Süt · Yumurta",
  karb: "Karbonhidrat",
  meyve: "Meyve",
  yag: "Yağ · Kuruyemiş",
  disari: "Dışarıda",
  benim: "Benim",
};
const SOURCE_TONE: Record<DbSource, string> = {
  temel: "text-ink-2 bg-veil/[0.06]",
  marka: "text-emerald bg-emerald/10",
  bim: "text-rose bg-rose/10",
  migros: "text-amber bg-amber/10",
  disari: "text-violet bg-violet/10",
  benim: "text-cyan bg-cyan/10",
};
const MACRO = { p: "#22D3EE", c: "#F59E0B", f: "#A78BFA" };

/** Besini seç → gramı yaz → kalori + makrolar anında hesaplanır */
export function GramCalculator() {
  const customDb = useAura((s) => s.data.customDb);
  const addGrams = useAura((s) => s.addGrams);
  const removeDbFood = useAura((s) => s.removeDbFood);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<DbGroup | "all">("all");
  const [sel, setSel] = useState<DbFood | null>(null);
  const [grams, setGrams] = useState("100");
  const [creating, setCreating] = useState(false);
  const gramRef = useRef<HTMLInputElement>(null);

  const all = useMemo(() => [...customDb, ...FOOD_DB], [customDb]);
  const list = useMemo(() => searchFoods(group === "all" ? all : all.filter((f) => f.group === group), q), [all, group, q]);
  const g = Number(grams.replace(",", "."));
  const valid = !!sel && g > 0 && g <= 5000;
  const m = sel && valid ? macrosFor(sel, g) : { kcal: 0, p: 0, c: 0, f: 0 };
  const unit = sel?.ml ? "ml" : "g";

  const pick = (f: DbFood) => {
    setSel(f);
    setGrams(String(f.unit ? f.unit.g : 100));
    requestAnimationFrame(() => {
      gramRef.current?.focus();
      gramRef.current?.select();
    });
  };
  const submit = () => {
    if (!valid || !sel) return;
    addGrams(sel, Math.round(g * 10) / 10);
  };

  return (
    <div>
      {/* Arama + grup filtresi */}
      <div className="relative mb-2.5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">
          <SearchIcon />
        </span>
        <input
          className="field !pl-9"
          placeholder={`${all.length} besin içinde ara: tavuk but, pirinç, Banvit, Dost, levrek…`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold border transition-colors ${
              group === g ? "bg-veil/[0.08] border-veil/10 text-ink" : "border-transparent text-ink-3 hover:text-ink-2"
            }`}
          >
            {GROUP_SHORT[g]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-3">
        {/* Liste */}
        <div className="scroll max-h-[352px] rounded-2xl border border-line bg-base/30 p-1.5 space-y-0.5">
          {list.length === 0 && (
            <div className="text-[12px] text-ink-3 text-center py-8">
              Sonuç yok.{" "}
              <button onClick={() => setCreating(true)} className="text-cyan hover:underline">
                Kendin ekle
              </button>
            </div>
          )}
          {list.map((f, i) => {
            const active = sel?.id === f.id;
            const header = group === "all" && (i === 0 || list[i - 1].group !== f.group);
            return (
              <div key={f.id}>
                {header && <div className="label !text-[9.5px] px-3 pt-2.5 pb-1">{GROUP_LABEL[f.group]}</div>}
                <button
                  onClick={() => pick(f)}
                  className={`group w-full text-left rounded-xl px-3 py-2 flex items-center gap-2 transition-colors ${
                    active ? "bg-emerald/[0.1] ring-1 ring-emerald/40" : "hover:bg-veil/[0.04]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12.5px] font-medium truncate">{f.name}</span>
                      {f.source !== "temel" && (
                        <span className={`shrink-0 text-[9px] font-bold px-1.5 py-px rounded ${SOURCE_TONE[f.source]}`}>
                          {SOURCE_LABEL[f.source].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="num text-[10.5px] text-ink-3">
                      <span style={{ color: MACRO.p }}>{f.p}P</span> · {f.c}K · {f.f}Y / 100{f.ml ? "ml" : "g"}
                    </div>
                  </div>
                  <span className="num text-[12.5px] font-semibold text-ink-2">{f.kcal}</span>
                  {f.source === "benim" && (
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sel?.id === f.id) setSel(null);
                        removeDbFood(f.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-ink-3 hover:text-rose"
                      title="Sil"
                    >
                      <Icon.trash size={12} />
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Hesaplayıcı */}
        <div className="rounded-2xl border border-line bg-gradient-to-b from-veil/[0.035] to-transparent p-4 flex flex-col">
          {/* AnimatePresence "wait" yok: seçim anında açılır, hızlı yazan kullanıcı tuş kaybetmez */}
          {!sel ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 grid place-items-center text-center py-6"
            >
              <div>
                <div className="mx-auto size-11 rounded-2xl grid place-items-center bg-emerald/10 text-emerald mb-3">
                  <Icon.scale size={18} />
                </div>
                <div className="text-[13px] font-semibold">Listeden bir besin seç</div>
                <div className="text-[11.5px] text-ink-3 mt-1 max-w-[220px]">Gramı yaz, kalori ve makrolar anında hesaplansın.</div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={sel.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold leading-snug">{sel.name}</div>
                  <div className="text-[10.5px] text-ink-3 mt-0.5">
                    {sel.brand ? `${sel.brand} · ` : ""}
                    {SOURCE_LABEL[sel.source]} · 100{unit} = {sel.kcal} kcal
                  </div>
                </div>
              </div>

              <form
                className="mt-3 flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="relative flex-1">
                  <input
                    ref={gramRef}
                    className="field num !h-12 !text-[22px] !font-semibold pr-10"
                    inputMode="decimal"
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    onFocus={(e) => e.currentTarget.select()}
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-3">{unit}</span>
                </div>
              </form>
              <div className="flex flex-wrap gap-1 mt-2">
                {[50, 100, 150, 200, 250, 300].map((v) => (
                  <button
                    key={v}
                    onClick={() => setGrams(String(v))}
                    className={`h-6 px-2 rounded-md text-[10.5px] num border transition-colors ${
                      g === v ? "border-emerald/50 text-emerald bg-emerald/10" : "border-line text-ink-3 hover:text-ink"
                    }`}
                  >
                    {v}
                  </button>
                ))}
                {sel.unit &&
                  [1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setGrams(String(n * sel.unit!.g))}
                      className={`h-6 px-2 rounded-md text-[10.5px] border transition-colors ${
                        g === n * sel.unit!.g ? "border-cyan/50 text-cyan bg-cyan/10" : "border-line text-ink-3 hover:text-ink"
                      }`}
                    >
                      {n} {sel.unit!.label}
                    </button>
                  ))}
              </div>

              {/* Sonuç */}
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="label !text-[9.5px]">Kalori</div>
                  <div className="num text-[34px] font-semibold leading-none mt-1">
                    <AnimatedNumber value={m.kcal} />
                    <span className="text-[12px] text-ink-3 ml-1">kcal</span>
                  </div>
                </div>
              </div>
              <MacroSplit p={m.p} c={m.c} f={m.f} />

              <Btn
                disabled={!valid}
                onClick={submit}
                className="mt-4 h-10 rounded-xl bg-gradient-to-r from-accent to-accent-2 text-on-accent text-[12.5px] font-bold disabled:opacity-30"
              >
                Günlüğe ekle
              </Btn>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <button
          onClick={() => setCreating((c) => !c)}
          className="text-[11.5px] font-semibold text-cyan hover:text-cyan-hi flex items-center gap-1"
        >
          {creating ? <Icon.minus size={13} /> : <Icon.plus size={13} />} Listede yok mu? Kendi besinini ekle (etiketteki 100 g değerleri)
        </button>
        <AnimatePresence initial={false}>{creating && <NewFoodForm onDone={() => setCreating(false)} />}</AnimatePresence>
      </div>
    </div>
  );
}

function MacroSplit({ p, c, f }: { p: number; c: number; f: number }) {
  const total = p * 4 + c * 4 + f * 9 || 1;
  const parts = [
    { k: "Protein", v: p, w: (p * 4) / total, col: MACRO.p },
    { k: "Karb", v: c, w: (c * 4) / total, col: MACRO.c },
    { k: "Yağ", v: f, w: (f * 9) / total, col: MACRO.f },
  ];
  return (
    <div className="mt-3">
      <div className="flex h-1.5 rounded-full overflow-hidden bg-veil/[0.05] gap-px">
        {parts.map((x) => (
          <motion.span
            key={x.k}
            className="h-full"
            style={{ background: x.col }}
            initial={false}
            animate={{ width: `${x.w * 100}%` }}
            transition={SPRING}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2.5">
        {parts.map((x) => (
          <div key={x.k}>
            <div className="text-[10px] text-ink-3 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" style={{ background: x.col }} />
              {x.k}
            </div>
            <div className="num text-[15px] font-semibold">
              {x.v.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}
              <span className="text-[10px] text-ink-3 ml-0.5">g</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewFoodForm({ onDone }: { onDone: () => void }) {
  const save = useAura((s) => s.saveDbFood);
  const [v, setV] = useState({ name: "", kcal: "", p: "", c: "", f: "" });
  const n = (x: string) => Number(x.replace(",", ".")) || 0;
  const valid = v.name.trim() && n(v.kcal) > 0;
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });

  return (
    <motion.form
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={SPRING}
      className="overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        save({
          name: v.name.trim(),
          kcal: Math.round(n(v.kcal)),
          p: n(v.p),
          c: n(v.c),
          f: n(v.f),
        });
        onDone();
      }}
    >
      <div className="grid grid-cols-[1fr_repeat(4,78px)_auto] gap-2 pt-2.5">
        <input className="field" placeholder="Besin adı (ör. BİM tavuk but)" value={v.name} onChange={set("name")} />
        <input className="field num" placeholder="kcal" inputMode="decimal" value={v.kcal} onChange={set("kcal")} />
        <input className="field num" placeholder="protein" inputMode="decimal" value={v.p} onChange={set("p")} />
        <input className="field num" placeholder="karb" inputMode="decimal" value={v.c} onChange={set("c")} />
        <input className="field num" placeholder="yağ" inputMode="decimal" value={v.f} onChange={set("f")} />
        <Btn
          type="submit"
          disabled={!valid}
          className="h-[38px] px-4 rounded-xl bg-cyan text-obsidian text-[12px] font-bold disabled:opacity-30"
        >
          Kaydet
        </Btn>
      </div>
      <div className="text-[10.5px] text-ink-3 mt-1.5">Değerler 100 g başına. Kaydedince "Benim" filtresinde her zaman hazır.</div>
    </motion.form>
  );
}

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
