import { colorHexFromPercent, formatarMoeda, formatarPercentual } from "@/lib/dashboard";
import type { WeekRow } from "@/lib/metrics";

export function WeeklyTable({ semanas }: { semanas: WeekRow[] }) {
  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 font-display text-base font-bold uppercase tracking-wide">
        Evolução Semanal (Mês Atual)
      </h3>
      <div className="min-h-0 flex-1 overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="pb-2 font-medium">Semana</th>
              <th className="pb-2 font-medium">Período</th>
              <th className="pb-2 text-right font-medium">Desafio</th>
              <th className="pb-2 text-right font-medium">Realizado</th>
              <th className="pb-2 text-right font-medium">% Desafio</th>
            </tr>
          </thead>
          <tbody>
            {semanas.map((w) => {
              const color = w.pct != null ? colorHexFromPercent(w.pct) : "#aeb9cc";
              return (
                <tr key={w.semana} className="border-t border-border/60">
                  <td className="py-3 font-semibold">{w.semana}</td>
                  <td className="py-3 text-muted-foreground">{w.periodo}</td>
                  <td className="py-3 text-right tabular-nums">{formatarMoeda(w.desafio)}</td>
                  <td className="py-3 text-right font-semibold tabular-nums">
                    {w.realizado != null ? formatarMoeda(w.realizado) : "—"}
                  </td>
                  <td className="py-3 text-right">
                    {w.pct != null ? (
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-xs font-bold tabular-nums"
                        style={{ background: `${color}22`, color }}
                      >
                        {formatarPercentual(w.pct)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
