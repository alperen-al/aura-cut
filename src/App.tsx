import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AnalyticsView } from "./components/AnalyticsView";
import { CalorieRing } from "./components/CalorieRing";
import { CheatCycle } from "./components/CheatCycle";
import { DayHeader } from "./components/DayHeader";
import { DayLog } from "./components/DayLog";
import { DeficitCard } from "./components/DeficitCard";
import { Emblem } from "./components/Emblem";
import { Guide } from "./components/Guide";
import { Supplements, Water } from "./components/Habits";
import { MealLibrary } from "./components/MealLibrary";
import { MotivationView } from "./components/MotivationView";
import { SettingsSheet } from "./components/SettingsSheet";
import { SmartSuggest } from "./components/SmartSuggest";
import { TitleBar } from "./components/TitleBar";
import { Toast } from "./components/Toast";
import { ClawBackdrop, UltraCard } from "./components/UltraCard";
import { WeightView } from "./components/WeightView";
import { DerivedProvider } from "./lib/derived";
import { flush, isTauri } from "./lib/storage";
import { useAura } from "./store/useAura";

export default function App() {
  const ready = useAura((s) => s.ready);
  const init = useAura((s) => s.init);
  const tick = useAura((s) => s.tick);
  const theme = useAura((s) => s.data.settings.theme);
  const motionPref = useAura((s) => s.data.settings.motion);

  // Tema: <html data-theme="ultra"> → CSS değişkenleri değişir, yeniden render gerekmez
  useEffect(() => {
    if (theme === "ultra") document.documentElement.dataset.theme = "ultra";
    else delete document.documentElement.dataset.theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.motion = motionPref;
  }, [motionPref]);

  useEffect(() => {
    void init();
    const t = setInterval(tick, 60_000); // gün dönümü kontrolü
    let unlisten: (() => void) | undefined;
    if (isTauri) {
      // Pencere kapanmadan önce bekleyen yazımı diske boşalt
      getCurrentWindow()
        .onCloseRequested(async () => {
          await flush();
        })
        .then((u) => (unlisten = u));
    }
    return () => {
      clearInterval(t);
      unlisten?.();
    };
  }, [init, tick]);

  useShortcuts();

  return (
    <MotionConfig reducedMotion={motionPref === "system" ? "user" : "never"}>
      <div className="relative h-full flex flex-col">
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="aura-orb aura-orb-a size-[520px] -left-40 -top-48" />
          <div className="aura-orb aura-orb-b size-[460px] -right-32 -bottom-40" />
        </div>
        <div aria-hidden className="grid-bg absolute inset-0 pointer-events-none" />
        {ready && <ClawBackdrop />}
        <AnimatePresence mode="wait">
          {!ready ? (
            <Splash key="splash" />
          ) : (
            <motion.div
              key="app"
              className="relative flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <DerivedProvider>
                <TitleBar />
                <Main />
                <SettingsSheet />
                <Guide />
                <Toast />
              </DerivedProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function Main() {
  const view = useAura((s) => s.view);
  return (
    <main className="relative flex-1 min-h-0 p-4">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          className="h-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.2, 0.9, 0.1, 1] }}
        >
          {view === "today" && <TodayView />}
          {view === "weight" && <WeightView />}
          {view === "analytics" && <AnalyticsView />}
          {view === "motivation" && <MotivationView />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function TodayView() {
  return (
    <div className="grid grid-cols-[320px_minmax(0,1fr)_350px] gap-4 h-full min-h-0">
      <div className="scroll space-y-4 pr-1 pb-4">
        <CalorieRing />
        <Supplements />
        <UltraCard />
        <Water />
      </div>
      <div className="scroll space-y-4 px-1 pb-4">
        <DayHeader />
        <MealLibrary />
        <SmartSuggest />
      </div>
      <div className="scroll space-y-4 pl-1 pb-4">
        <DayLog />
        <CheatCycle />
        <DeficitCard />
      </div>
    </div>
  );
}

function Splash() {
  return (
    <motion.div className="flex-1 grid place-items-center" exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.2 }}>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Emblem size={72} />
      </motion.div>
    </motion.div>
  );
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea")) return;
      const s = useAura.getState();
      if (!s.ready || s.settingsOpen || s.guideOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        s.undo();
      } else if (e.key === "ArrowLeft") s.shiftDate(-1);
      else if (e.key === "ArrowRight") s.shiftDate(1);
      else if (e.key === "1") s.setView("today");
      else if (e.key === "2") s.setView("weight");
      else if (e.key === "3") s.setView("analytics");
      else if (e.key === "4") s.setView("motivation");
      else if (e.key === "?" || e.key === "F1") s.setGuideOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
