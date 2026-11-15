import { motion } from "motion/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Emblem, Wordmark } from "./Emblem";
import { Btn, Icon, SPRING } from "./ui";
import { useAura, type View } from "../store/useAura";
import { useDerived } from "../lib/derived";
import { flush, isTauri } from "../lib/storage";

const VIEWS: { id: View; label: string; key: string }[] = [
  { id: "today", label: "Bugün", key: "1" },
  { id: "weight", label: "Tartı", key: "2" },
  { id: "analytics", label: "Analiz", key: "3" },
  { id: "motivation", label: "Motivasyon", key: "4" },
];

const win = () => getCurrentWindow();

export function TitleBar() {
  const view = useAura((s) => s.view);
  const setView = useAura((s) => s.setView);
  const openSettings = useAura((s) => s.setSettingsOpen);
  const openGuide = useAura((s) => s.setGuideOpen);
  const toggleTheme = useAura((s) => s.toggleTheme);
  const theme = useAura((s) => s.data.settings.theme);
  const { streak, todayEval } = useDerived();
  const compDays = useAura((s) => s.data.settings.compDays);

  return (
    <header
      data-tauri-drag-region
      className="relative z-30 h-12 shrink-0 flex items-center gap-4 pl-4 pr-1 border-b border-line bg-base/40"
    >
      <div data-tauri-drag-region className="flex items-center gap-2.5 min-w-[200px]">
        <Emblem size={26} />
        <Wordmark />
      </div>

      {/* Görünüm seçici */}
      <nav className="flex items-center gap-1 p-1 rounded-xl bg-veil/[0.03] border border-line">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`relative h-7 px-3.5 rounded-lg text-[12px] font-semibold transition-colors ${
              view === v.id ? "text-ink" : "text-ink-3 hover:text-ink-2"
            }`}
            title={`${v.label} (${v.key})`}
          >
            {view === v.id && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-lg bg-veil/[0.07] border border-veil/[0.08]"
                transition={SPRING}
              />
            )}
            <span className="relative">{v.label}</span>
          </button>
        ))}
      </nav>

      <div data-tauri-drag-region className="flex-1 h-full" />

      {/* Durum çipleri */}
      {todayEval.mode === "telafi" && (
        <span className="chip !text-amber !border-amber/30 !bg-amber/10">
          <span className="size-1.5 rounded-full bg-amber animate-pulse" />
          Telafi {todayEval.compIndex}/{compDays}
        </span>
      )}
      <span className="chip" title="Ardışık başarılı gün">
        <span className={`text-emerald ${streak > 0 ? "aura-flicker" : ""}`}>
          <Icon.flame size={13} />
        </span>
        <span className="num text-ink">{streak}</span> gün seri
      </span>

      <Btn
        onClick={toggleTheme}
        className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg text-[11px] font-semibold text-ink-3 hover:text-ink hover:bg-veil/5"
        title="Temayı değiştir"
      >
        <span
          className="size-3.5 rounded-full border border-line"
          style={{ background: theme === "ultra" ? "linear-gradient(135deg,#fff,#cfd6df)" : "linear-gradient(135deg,#10B981,#090A0F)" }}
        />
        {theme === "ultra" ? "Ultra Beyaz" : "Obsidyen"}
      </Btn>
      <Btn
        onClick={() => openGuide(true)}
        className="size-8 grid place-items-center rounded-lg text-ink-3 hover:text-ink hover:bg-veil/5 text-[14px] font-bold"
        title="Kullanım kılavuzu"
        aria-label="Kullanım kılavuzu"
      >
        ?
      </Btn>
      <Btn
        onClick={() => openSettings(true)}
        className="size-8 grid place-items-center rounded-lg text-ink-3 hover:text-ink hover:bg-veil/5"
        title="Ayarlar"
      >
        <Icon.gear size={16} />
      </Btn>

      {isTauri && (
        <div className="flex items-center h-full ml-1">
          <WinBtn label="Simge durumuna küçült" onClick={() => win().minimize()}>
            <path d="M5 12h14" />
          </WinBtn>
          <WinBtn label="Büyüt" onClick={() => win().toggleMaximize()}>
            <rect x="6" y="6" width="12" height="12" rx="1.5" />
          </WinBtn>
          <WinBtn
            label="Tepsiye gizle (RAM serbest bırakılır)"
            danger
            onClick={async () => {
              await flush();
              await win().close();
            }}
          >
            <path d="M7 7l10 10M17 7 7 17" />
          </WinBtn>
        </div>
      )}
    </header>
  );
}

function WinBtn({ children, onClick, label, danger }: { children: React.ReactNode; onClick: () => void; label: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`h-full w-11 grid place-items-center text-ink-3 transition-colors ${
        danger ? "hover:bg-rose/80 hover:text-white" : "hover:bg-veil/[0.06] hover:text-ink"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        {children}
      </svg>
    </button>
  );
}
