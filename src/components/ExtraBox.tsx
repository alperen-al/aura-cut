import { useMemo, useState } from "react";
import { useAura } from "../store/useAura";
import { Btn, Icon } from "./ui";

/**
 * Diyet dışı bir şey mi yedin? Sadece adını ve kalorisini yaz.
 * Son ekstralar geçmiş günlerden otomatik toplanır → tek tıkla tekrar ekle.
 */
export function ExtraBox() {
  const addExtra = useAura((s) => s.addExtra);
  const days = useAura((s) => s.data.days);
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const k = Number(kcal.replace(",", "."));
  const valid = name.trim().length > 0 && k > 0 && k < 10000;

  const recent = useMemo(() => {
    const seen = new Map<string, number>();
    for (const key of Object.keys(days).sort().reverse()) {
      for (const e of days[key].entries) {
        if (e.category === "ekstra" && !seen.has(e.name)) seen.set(e.name, e.kcal);
        if (seen.size >= 8) break;
      }
      if (seen.size >= 8) break;
    }
    return [...seen.entries()];
  }, [days]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber/25 bg-amber/[0.05] p-4">
        <div className="text-[13px] font-semibold">Diyet dışı bir şey mi yedin?</div>
        <div className="text-[11.5px] text-ink-3 mt-0.5">Adını ve paketteki/tahmini kalorisini yaz, gerisini sistem halleder.</div>
        <form
          className="grid grid-cols-[1fr_140px_auto] gap-2 mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            addExtra(name.trim(), k);
            setName("");
            setKcal("");
          }}
        >
          <input className="field" placeholder="Ne yedin? (ör. 2 dilim pizza)" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="relative">
            <input
              className="field num pr-11"
              placeholder="Kalori"
              inputMode="numeric"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-3">kcal</span>
          </div>
          <Btn
            type="submit"
            disabled={!valid}
            className="h-[38px] px-5 rounded-xl bg-amber text-obsidian text-[12px] font-bold disabled:opacity-30"
          >
            Ekle
          </Btn>
        </form>
      </div>

      {recent.length > 0 && (
        <div>
          <div className="label mb-2">Son ekstralar</div>
          <div className="flex flex-wrap gap-1.5">
            {recent.map(([n, kc]) => (
              <Btn
                key={n}
                onClick={() => addExtra(n, kc)}
                className="h-8 px-3 rounded-lg border border-line bg-veil/[0.025] hover:border-amber/40 text-[11.5px] flex items-center gap-2"
              >
                <Icon.plus size={12} />
                {n}
                <span className="num text-ink-3">{kc}</span>
              </Btn>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-ink-3 flex items-center gap-1.5">
        <Icon.info size={13} /> Gün sonu toplam 2000–2200 bandındaysa içinde ekstra olsa bile gün başarılı sayılır.
      </p>
    </div>
  );
}
