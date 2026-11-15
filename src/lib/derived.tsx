import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAura } from "../store/useAura";
import {
  deficitReport,
  evaluate,
  projection,
  streak,
  weeklyAverages,
  weightSeries,
  type DayEval,
  type DeficitReport,
  type Projection,
  type WeekAvg,
  type WeightPoint,
} from "./engine";
import type { DateKey } from "./date";

export interface Derived {
  evals: Map<DateKey, DayEval>;
  todayEval: DayEval;
  selEval: DayEval;
  weights: WeightPoint[];
  weekly: WeekAvg[];
  deficit: DeficitReport;
  proj: Projection | null;
  streak: number;
}

const Ctx = createContext<Derived | null>(null);

/** Motoru veri değiştiğinde TEK kez çalıştırır; tüm bileşenler aynı sonucu okur */
export function DerivedProvider({ children }: { children: ReactNode }) {
  const data = useAura((s) => s.data);
  const today = useAura((s) => s.today);
  const selected = useAura((s) => s.selected);

  const core = useMemo(() => {
    const evals = evaluate(data, today, selected);
    const weights = weightSeries(data);
    const deficit = deficitReport(data, evals, today);
    return {
      evals,
      weights,
      weekly: weeklyAverages(weights),
      deficit,
      proj: projection(data, weights, deficit.avgDaily, today),
      streak: streak(evals, today),
    };
  }, [data, today, selected]);

  const value = useMemo<Derived>(
    () => ({ ...core, todayEval: core.evals.get(today)!, selEval: core.evals.get(selected)! }),
    [core, today, selected],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useDerived = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("DerivedProvider eksik");
  return v;
};
