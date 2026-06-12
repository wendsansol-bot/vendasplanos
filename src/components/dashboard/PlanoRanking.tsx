import { formatarMoeda, formatarPercentual } from "@/lib/dashboard";
import type { PlanoRow } from "@/lib/metrics";

const BAR_COLORS = ["#1e90ff", "#35c94a", "#ff9f1c", "#a855f7", "#facc15", "#ff3b30"];

export function PlanoRanking({ planos }: { planos: PlanoRow[] }) {
  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 font-display text-base font-bold uppercase tracking-wide">
        Ranking de Tipo de Plano Vendido
      </h3>
      <div className="min-h-0 flex-1 overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="pb-2 font-medium">#</th>
              <th className="pb-2 font-medium">Tipo de Plano</th>
              <th className="pb-2 text-center font-medium">Qtde</th>
              <th className="pb-2 text-right font-medium">Faturamento</th>
              <th className="pb-2 pl-3 font-medium">% Part.</th>
            </tr>
          </thead>
          <tbody>
            {planos.map((p, i) => (
              <tr key={p.plano} className="border-t border-border/60">
                <td className="py-2.5 font-display font-bold text-muted-foreground">{p.posicao}</td>
                <td className="py-2.5 font-semibold">{p.plano}</td>
                <td className="py-2.5 text-center tabular-nums">{p.qtd}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums">{formatarMoeda(p.faturamento)}</td>
                <td className="py-2.5 pl-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(3, p.participacao)}%`,
                          background: BAR_COLORS[i % BAR_COLORS.length],
                          boxShadow: `0 0 8px ${BAR_COLORS[i % BAR_COLORS.length]}88`,
                          transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-semibold tabular-nums">
                      {formatarPercentual(p.participacao)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
