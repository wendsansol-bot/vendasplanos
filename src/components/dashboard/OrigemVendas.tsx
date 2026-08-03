import { colorHexFromPercent, formatarMoeda, formatarPercentual } from "@/lib/dashboard";
import type { OrigemRow } from "@/lib/metrics";

export function OrigemVendas({ origens }: { origens: OrigemRow[] }) {
  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 font-display text-base font-bold uppercase tracking-wide">
        Origem das Vendas
      </h3>
      <div className="min-h-0 flex-1 overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="pb-2 font-medium">Origem</th>
              <th className="pb-2 text-center font-medium">Qtd</th>
              <th className="pb-2 text-right font-medium">Faturamento</th>
              <th className="pb-2 text-right font-medium">Prev.</th>
              <th className="pb-2 text-right font-medium">Real.</th>
              <th className="pb-2 pl-3 font-medium">Atingimento</th>
            </tr>
          </thead>
          <tbody>
            {origens.map((o) => {
              const cor = colorHexFromPercent(o.atingimento);
              return (
                <tr key={o.origem} className="border-t border-border/60">
                  <td className="py-2.5 font-semibold">{o.origem}</td>
                  <td className="py-2.5 text-center tabular-nums">{o.qtd}</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums">
                    {formatarMoeda(o.faturamento)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                    {formatarPercentual(o.pctPrevisto)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    {formatarPercentual(o.pctRealizado)}
                  </td>
                  <td className="py-2.5 pl-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, o.atingimento)}%`,
                            background: cor,
                            boxShadow: o.atingimento > 0 ? `0 0 8px ${cor}88` : "none",
                            transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
                          }}
                        />
                      </div>
                      <span
                        className="w-10 text-right text-xs font-semibold tabular-nums"
                        style={{ color: cor }}
                      >
                        {formatarPercentual(o.atingimento)}
                      </span>
                    </div>
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
