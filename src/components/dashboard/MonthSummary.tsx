import { Target, Wallet, Percent, Receipt, ShoppingCart, CalendarCheck } from "lucide-react";
import {
  colorHexFromPercent,
  formatarMoeda,
  formatarPercentual,
} from "@/lib/dashboard";
import type { Metrics } from "@/lib/metrics";

export function MonthSummary({ m }: { m: Metrics }) {
  const rows = [
    { icon: <Target size={16} />, label: "Desafio mensal", value: formatarMoeda(m.desafioMensal) },
    {
      icon: <Wallet size={16} />,
      label: "Realizado no mês",
      value: formatarMoeda(m.realizadoMes),
      color: "var(--green)",
    },
    {
      icon: <Percent size={16} />,
      label: "% Atingido",
      value: formatarPercentual(m.pctMensal, 2),
      color: colorHexFromPercent(m.pctMensal),
    },
    { icon: <Receipt size={16} />, label: "Ticket médio", value: formatarMoeda(m.ticketMedio) },
    { icon: <ShoppingCart size={16} />, label: "Quantidade de vendas", value: String(m.qtdVendas) },
    {
      icon: <CalendarCheck size={16} />,
      label: "Melhor dia",
      value: `${m.melhorDiaLabel} (${formatarMoeda(m.melhorDiaValor)})`,
      color: "var(--green)",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 font-display text-base font-bold uppercase tracking-wide">Resumo do Mês</h3>
      <div className="flex min-h-0 flex-1 flex-col justify-between">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
            <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 text-muted-foreground">
                {r.icon}
              </span>
              {r.label}
            </span>
            <span className="font-display text-sm font-bold" style={{ color: r.color ?? "var(--foreground)" }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
