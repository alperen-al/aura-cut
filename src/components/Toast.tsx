import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useAura } from "../store/useAura";
import { Icon, SPRING, TONE_HEX } from "./ui";

export function Toast() {
  const toast = useAura((s) => s.toast);
  const dismiss = useAura((s) => s.dismissToast);
  const undo = useAura((s) => s.undo);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismiss, toast.undo ? 4200 : 2600);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
      <AnimatePresence mode="popLayout">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={SPRING}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-titanium-2/95 border px-4 h-11 shadow-2xl"
            style={{ borderColor: `${TONE_HEX[toast.tone]}55`, boxShadow: `0 12px 40px -12px ${TONE_HEX[toast.tone]}66` }}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: TONE_HEX[toast.tone], boxShadow: `0 0 10px ${TONE_HEX[toast.tone]}` }}
            />
            <span className="text-[12.5px] font-medium whitespace-nowrap">{toast.text}</span>
            {toast.undo && (
              <button onClick={undo} className="flex items-center gap-1 text-[11.5px] font-semibold text-cyan hover:text-cyan-hi ml-1">
                <Icon.undo size={13} /> Geri al
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
