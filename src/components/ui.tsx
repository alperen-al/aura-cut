import { motion, useSpring, useTransform, type HTMLMotionProps } from "motion/react";
import { useEffect, type ReactNode } from "react";
import type { DayStatus } from "../lib/engine";

export const SPRING = { type: "spring", stiffness: 520, damping: 32, mass: 0.6 } as const;
export const SOFT = { type: "spring", stiffness: 260, damping: 30 } as const;

export type Tone = "emerald" | "cyan" | "amber" | "rose" | "violet" | "muted";

export const TONE_HEX: Record<Tone, string> = {
  emerald: "#10B981",
  cyan: "#06B6D4",
  amber: "#F59E0B",
  rose: "#F43F5E",
  violet: "#8B5CF6",
  muted: "#7C8598",
};

export const statusTone = (s: DayStatus): Tone =>
  ({
    under: "cyan",
    success: "emerald",
    over: "amber",
    trigger: "rose",
    free: "violet",
    empty: "muted",
    open: "muted",
    future: "muted",
  })[s] as Tone;

export const STATUS_LABEL: Record<DayStatus, string> = {
  under: "Hedef altı",
  success: "Başarılı gün",
  over: "Hedef üstü",
  trigger: "Telafi tetiklendi",
  free: "Serbest gün",
  empty: "Kayıt yok",
  open: "Gün açık",
  future: "Planlı",
};

/** Yaylanan basma efektli buton (transform-only → kompozitör katmanında, 120 FPS) */
export function Btn({ children, className, ...rest }: HTMLMotionProps<"button"> & { children?: ReactNode }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.96 }} whileHover={{ y: -1 }} transition={SPRING} className={className} {...rest}>
      {children}
    </motion.button>
  );
}

/** Yay fiziğiyle sayan sayı — her karede React render'ı yok, doğrudan DOM */
export function AnimatedNumber({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 140, damping: 24, mass: 0.8 });
  useEffect(() => spring.set(value), [spring, value]);
  const text = useTransform(spring, (v) => v.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  return <motion.span className={className}>{text}</motion.span>;
}

export function PanelTitle({ children, right, icon }: { children: ReactNode; right?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-ink-3">{icon}</span>}
        <h3 className="label">{children}</h3>
      </div>
      {right}
    </div>
  );
}

export function Bar({ value, max, tone = "cyan", height = 6 }: { value: number; max: number; tone?: Tone; height?: number }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <div className="w-full rounded-full bg-veil/[0.05] overflow-hidden" style={{ height }}>
      <motion.div
        className="h-full rounded-full origin-left"
        style={{
          background: `linear-gradient(90deg, ${TONE_HEX[tone]}99, ${TONE_HEX[tone]})`,
          boxShadow: `0 0 12px ${TONE_HEX[tone]}66`,
        }}
        initial={false}
        animate={{ scaleX: pct }}
        transition={SOFT}
      />
    </div>
  );
}

/* ── İkonlar (inline, bağımlılık yok) ───────────────────────── */
const I = ({ d, size = 16, stroke = 1.8 }: { d: ReactNode; size?: number; stroke?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);
export const Icon = {
  plus: (p: { size?: number }) => <I {...p} d={<path d="M12 5v14M5 12h14" />} />,
  minus: (p: { size?: number }) => <I {...p} d={<path d="M5 12h14" />} />,
  x: (p: { size?: number }) => <I {...p} d={<path d="M6 6l12 12M18 6 6 18" />} />,
  check: (p: { size?: number }) => <I {...p} stroke={2.4} d={<path d="m5 12.5 4.5 4.5L19 7.5" />} />,
  left: (p: { size?: number }) => <I {...p} d={<path d="m15 18-6-6 6-6" />} />,
  right: (p: { size?: number }) => <I {...p} d={<path d="m9 18 6-6-6-6" />} />,
  gear: (p: { size?: number }) => (
    <I
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </>
      }
    />
  ),
  lock: (p: { size?: number }) => (
    <I
      {...p}
      d={
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      }
    />
  ),
  unlock: (p: { size?: number }) => (
    <I
      {...p}
      d={
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 7.5-2" />
        </>
      }
    />
  ),
  flame: (p: { size?: number }) => (
    <I {...p} d={<path d="M12 22c4 0 7-2.7 7-7 0-3.5-2.5-6-4-8-.5 2-1.5 3-3 3 .5-3-1-6-4-8 0 4-5 6.5-5 13 0 4.3 4 7 9 7Z" />} />
  ),
  drop: (p: { size?: number }) => <I {...p} d={<path d="M12 2.5s7 7.6 7 12.5a7 7 0 0 1-14 0c0-4.9 7-12.5 7-12.5Z" />} />,
  bolt: (p: { size?: number }) => <I {...p} d={<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />} />,
  scale: (p: { size?: number }) => (
    <I
      {...p}
      d={
        <>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M8 9a5 5 0 0 1 8 0l-2.5 2.5" />
        </>
      }
    />
  ),
  pill: (p: { size?: number }) => (
    <I
      {...p}
      d={
        <>
          <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" />
          <path d="m8.5 8.5 7 7" />
        </>
      }
    />
  ),
  dumbbell: (p: { size?: number }) => <I {...p} d={<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />} />,
  undo: (p: { size?: number }) => <I {...p} d={<path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />} />,
  trash: (p: { size?: number }) => <I {...p} d={<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" />} />,
  spark: (p: { size?: number }) => (
    <I {...p} d={<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />} />
  ),
  moon: (p: { size?: number }) => <I {...p} d={<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />} />,
  target: (p: { size?: number }) => (
    <I
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </>
      }
    />
  ),
  info: (p: { size?: number }) => (
    <I
      {...p}
      d={
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </>
      }
    />
  ),
};
