import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { isTauri } from "../lib/storage";
import type { Settings } from "../lib/types";
import { useAura } from "../store/useAura";
import { Btn, Icon, SPRING } from "./ui";

type NumKey = { [K in keyof Settings]: Settings[K] extends number ? K : never }[keyof Settings];

const GROUPS: { title: string; fields: { k: NumKey; label: string; unit?: string; step?: number }[] }[] = [
  {
    title: "Kalori & Protein",
    fields: [
      { k: "kcalMin", label: "Band alt", unit: "kcal" },
      { k: "kcalMax", label: "Band üst", unit: "kcal" },
      { k: "kcalTarget", label: "Hedef ortalama", unit: "kcal" },
      { k: "proteinTarget", label: "Protein", unit: "g" },
    ],
  },
  {
    title: "Telafi Protokolü & Serbest Öğün",
    fields: [
      { k: "triggerOver", label: "Tetik (hedef +)", unit: "kcal" },
      { k: "compMin", label: "Telafi alt", unit: "kcal" },
      { k: "compMax", label: "Telafi üst", unit: "kcal" },
      { k: "compDays", label: "Telafi süresi", unit: "gün" },
      { k: "cheatEvery", label: "Serbest öğün", unit: "günde 1" },
      { k: "cheatCap", label: "Serbest gün tavanı", unit: "kcal" },
    ],
  },
  {
    title: "Harcama (TDEE) & Vücut",
    fields: [
      { k: "tdeeTraining", label: "Antrenman günü", unit: "kcal" },
      { k: "tdeeRest", label: "Dinlenme günü", unit: "kcal" },
      { k: "startWeight", label: "Başlangıç", unit: "kg", step: 0.1 },
      { k: "goalMax", label: "Hedef üst", unit: "kg", step: 0.1 },
      { k: "goalMin", label: "Hedef alt", unit: "kg", step: 0.1 },
      { k: "heightCm", label: "Boy", unit: "cm" },
      { k: "waterTargetMl", label: "Su hedefi", unit: "ml" },
      { k: "rolloverHour", label: "Gün dönümü", unit: "saat" },
    ],
  },
];

export function SettingsSheet() {
  const open = useAura((s) => s.settingsOpen);
  const setOpen = useAura((s) => s.setSettingsOpen);
  const settings = useAura((s) => s.data.settings);
  const update = useAura((s) => s.updateSettings);
  const exportJson = useAura((s) => s.exportJson);
  const importJson = useAura((s) => s.importJson);
  const showToast = useAura((s) => s.showToast);
  const [auto, setAuto] = useState<boolean | null>(null);
  const [paste, setPaste] = useState("");

  useEffect(() => {
    if (open && isTauri)
      isEnabled()
        .then(setAuto)
        .catch(() => setAuto(null));
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-base/70" onClick={() => setOpen(false)} />
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={SPRING}
            className="relative w-[440px] h-full scroll bg-titanium border-l border-line p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold">Ayarlar</h2>
              <Btn
                onClick={() => setOpen(false)}
                className="size-8 grid place-items-center rounded-lg text-ink-3 hover:text-ink hover:bg-veil/5"
              >
                <Icon.x />
              </Btn>
            </div>

            {isTauri && (
              <div className="rounded-2xl border border-line bg-veil/[0.02] p-4 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold">Windows ile başlat</div>
                  <div className="text-[11px] text-ink-3">Açılışta tepside sessizce bekler (~birkaç MB)</div>
                </div>
                <Toggle
                  on={!!auto}
                  onChange={async (v) => {
                    try {
                      if (v) await enable();
                      else await disable();
                      setAuto(await isEnabled());
                    } catch {
                      showToast({ text: "Otomatik başlatma ayarlanamadı", tone: "rose" });
                    }
                  }}
                />
              </div>
            )}

            <div className="rounded-2xl border border-line bg-veil/[0.02] p-4 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold">Animasyonlar her zaman açık</div>
                <div className="text-[11px] text-ink-3">Kapalıysa Windows'un "animasyon efektleri" ayarına uyar</div>
              </div>
              <Toggle on={settings.motion === "always"} onChange={(v) => update({ motion: v ? "always" : "system" })} />
            </div>

            {GROUPS.map((g) => (
              <div key={g.title}>
                <div className="label mb-2.5">{g.title}</div>
                <div className="grid grid-cols-2 gap-2">
                  {g.fields.map((f) => (
                    <label key={f.k} className="rounded-xl border border-line bg-veil/[0.02] px-3 py-2 focus-within:border-cyan/50">
                      <div className="text-[10.5px] text-ink-3">{f.label}</div>
                      <div className="flex items-baseline gap-1">
                        <input
                          type="number"
                          step={f.step ?? 1}
                          className="num w-full bg-transparent outline-none text-[15px] font-semibold"
                          value={settings[f.k]}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (Number.isFinite(v) && v >= 0) update({ [f.k]: v } as Partial<Settings>);
                          }}
                        />
                        {f.unit && <span className="text-[10px] text-ink-3 whitespace-nowrap">{f.unit}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <div className="label mb-2.5">Yedek</div>
              <div className="flex gap-2">
                <Btn
                  className="flex-1 h-9 rounded-xl border border-line bg-veil/[0.03] text-[12px] font-semibold hover:border-cyan/40"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(exportJson());
                      showToast({ text: "Tüm veri panoya kopyalandı", tone: "cyan" });
                    } catch {
                      showToast({ text: "Panoya erişilemedi", tone: "rose" });
                    }
                  }}
                >
                  Panoya kopyala
                </Btn>
                <Btn
                  className="flex-1 h-9 rounded-xl border border-line bg-veil/[0.03] text-[12px] font-semibold hover:border-emerald/40 disabled:opacity-30"
                  disabled={!paste.trim()}
                  onClick={() => {
                    if (importJson(paste)) setPaste("");
                    else showToast({ text: "Geçersiz yedek verisi", tone: "rose" });
                  }}
                >
                  Geri yükle
                </Btn>
              </div>
              <textarea
                className="field !h-20 py-2 mt-2 num !text-[11px] resize-none"
                placeholder="Geri yüklemek için yedek JSON'u buraya yapıştır"
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
              />
            </div>

            <div className="text-[10.5px] text-ink-3 leading-relaxed">
              Kısayollar: <span className="num text-ink-2">1 / 2 / 3</span> görünümler · <span className="num text-ink-2">← →</span> günler
              · <span className="num text-ink-2">Ctrl+Z</span> geri al · <span className="num text-ink-2">Esc</span> kapat
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-emerald shadow-[0_0_14px_rgba(16,185,129,.5)]" : "bg-veil/10"}`}
    >
      <motion.span className="absolute top-0.5 size-5 rounded-full bg-white" animate={{ left: on ? 22 : 2 }} transition={SPRING} />
    </button>
  );
}
