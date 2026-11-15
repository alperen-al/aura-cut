import { useId } from "react";

/**
 * AURA CUT amblemi
 * - Dış: keskin hatlı altıgen kalkan (zümrüt → cyan gradyan kontur)
 * - İç: ince ikinci altıgen (hassasiyet halkası)
 * - Merkez: yukarı ivmelenen çift şeritli prizma (Λ) — sol şerit zümrüt, sağ şerit cyan.
 *   Aynı zamanda "A" monogramı; ortadaki elmas çekirdek neşter sırtını temsil eder.
 */
export function Emblem({ size = 28, glow = true, className }: { size?: number; glow?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-label="AURA CUT">
      <defs>
        <linearGradient id={`${id}s`} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="32" y1="3" x2="32" y2="61" gradientUnits="userSpaceOnUse">
          <stop stopColor="#161822" />
          <stop offset="1" stopColor="#090A0F" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="32" y1="10" x2="21" y2="49" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6EE7B7" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="32" y1="10" x2="43" y2="49" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="1" stopColor="#0891B2" />
        </linearGradient>
        {glow && (
          <filter id={`${id}g`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Kalkan */}
      <path
        d="M32 3 57.1 17.5v29L32 61 6.9 46.5v-29L32 3Z"
        fill={`url(#${id}f)`}
        stroke={`url(#${id}s)`}
        strokeWidth="2.2"
        strokeLinejoin="miter"
        filter={glow ? `url(#${id}g)` : undefined}
      />
      <path d="M32 9.2 51.7 20.6v22.8L32 54.8 12.3 43.4V20.6L32 9.2Z" stroke="#fff" strokeOpacity=".07" strokeWidth=".8" />

      {/* Çift şeritli prizma */}
      <g filter={glow ? `url(#${id}g)` : undefined}>
        <path d="M32 10 32 21 27 49H21L32 10Z" fill={`url(#${id}l)`} />
        <path d="M32 10 43 49H37L32 21V10Z" fill={`url(#${id}r)`} />
      </g>
      {/* Neşter sırtı / çekirdek */}
      <path d="M32 29.5 34.6 36 32 42.5 29.4 36 32 29.5Z" fill="#E8FFF7" fillOpacity=".92" />
      <path d="M32 44.5v6" stroke="#06B6D4" strokeOpacity=".6" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`tracking-[0.32em] text-[12.5px] ${className ?? ""}`}>
      <span className="font-bold text-ink">AURA</span>
      <span className="font-light text-ink-2"> CUT</span>
    </span>
  );
}
