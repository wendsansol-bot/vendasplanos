import { ChevronDown } from "lucide-react";
import type { Filters } from "@/lib/dashboard";

interface Option {
  key: keyof Filters;
  label: string;
  all: string;
  options: string[];
}

interface Props {
  filters: Filters;
  options: {
    responsavel: string[];
    empresa: string[];
    cidade: string[];
    plano: string[];
    pagamento: string[];
  };
  onChange: (key: keyof Filters, value: string) => void;
}

export function FilterBar({ filters, options, onChange }: Props) {
  const defs: Option[] = [
    { key: "periodo", label: "Período", all: "Mês atual", options: ["Mês atual"] },
    { key: "responsavel", label: "Responsável", all: "Todos", options: options.responsavel },
    { key: "empresa", label: "Empresa", all: "Todas", options: options.empresa },
    { key: "cidade", label: "Cidade", all: "Todas", options: options.cidade },
    { key: "plano", label: "Plano", all: "Todos", options: options.plano },
    { key: "pagamento", label: "Pagamento", all: "Todos", options: options.pagamento },
  ];

  return (
    <div className="grid grid-cols-6 gap-3">
      {defs.map((d) => (
        <label
          key={d.key}
          className="card-surface group relative flex flex-col gap-0.5 px-4 py-2"
        >
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{d.label}</span>
          <div className="flex items-center justify-between">
            <select
              value={filters[d.key]}
              onChange={(e) => onChange(d.key, e.target.value)}
              className="w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-foreground outline-none [&>option]:bg-card [&>option]:text-foreground"
            >
              <option value={d.all}>{d.all}</option>
              {d.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none text-muted-foreground" />
          </div>
        </label>
      ))}
    </div>
  );
}
