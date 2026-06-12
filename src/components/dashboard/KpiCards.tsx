import { Target, CalendarRange, CalendarDays, Gauge, TrendingUp } from "lucide-react";
import {
  colorHexFromPercent,
  formatarMoeda,
  formatarPercentual,
  statusTexto,
} from "@/lib/dashboard";
import type { Metrics } from "@/lib/metrics";
import { CircularProgress } from "./CircularProgress";

const accentVar: Record<string, string> = {
  blue: "var(--blue)",
  green: "var(--green)",
  orange: "var(--orange)",
  purple: "var(--purple)",
};

function Card({
  accent,
  icon,
  title,
  children,
}: {
  accent: keyof typeof accentVar;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const color = accentVar[accent];
  return (
    <div
      className="card-surface group relative flex h-full flex-col overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1"
      style={{ borderTop: `2px solid ${color}` }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: color }}
      />
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ background: `color-mix(in oklab, ${color} 22%, transparent)`, color }}
        >
          {icon}
        </span>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide" style={{ color }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function KpiCards({ m }: { m: Metrics }) {
  return (
    <div className="grid h-full grid-cols-4 gap-4">
      {/* Desafio Mensal */}
      <Card accent="blue" icon={<Target size={18} />} title="Desafio Mensal">
        <div className="flex flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Desafio</p>
            <p className="font-display text-2xl font-bold leading-tight">{formatarMoeda(m.desafioMensal)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Realizado</p>
            <p className="font-display text-2xl font-bold leading-tight" style={{ color: "var(--blue)" }}>
              {formatarMoeda(m.realizadoMes)}
            </p>
          </div>
          <CircularProgress pct={m.pctMensal} decimals={2} />
        </div>
        <Bar pct={m.pctMensal} />
        <p className="mt-2 text-xs">
          <span className="text-muted-foreground">Falta para o desafio: </span>
          <span className="font-semibold">{formatarMoeda(m.faltaMensal)}</span>
        </p>
      </Card>

      {/* Desafio Semanal */}
      <Card accent="green" icon={<CalendarRange size={18} />} title="Desafio Semanal">
        <div className="flex flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Desafio</p>
            <p className="font-display text-2xl font-bold leading-tight">{formatarMoeda(m.desafioSemanal)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Realizado</p>
            <p className="font-display text-2xl font-bold leading-tight" style={{ color: "var(--green)" }}>
              {formatarMoeda(m.realizadoSemana)}
            </p>
          </div>
          <CircularProgress pct={m.pctSemanal} />
        </div>
        <div
          className="mt-2 rounded-lg px-3 py-1.5 text-xs"
          style={{ background: "color-mix(in oklab, var(--green) 14%, transparent)" }}
        >
          <span className="text-muted-foreground">
            {m.faltaSemanal > 0 ? "Falta: " : "Acima: "}
          </span>
          <span className="font-semibold">{formatarMoeda(m.faltaSemanal > 0 ? m.faltaSemanal : m.realizadoSemana - m.desafioSemanal)}</span>
        </div>
        <StatusLine pct={m.pctSemanal} escopo="semanal" />
      </Card>

      {/* Desafio Diário */}
      <Card accent="orange" icon={<CalendarDays size={18} />} title="Desafio Diário">
        <div className="flex flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Desafio diário (6 dias)</p>
            <p className="font-display text-2xl font-bold leading-tight">{formatarMoeda(m.desafioDiario)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Realizado hoje</p>
            <p className="font-display text-2xl font-bold leading-tight" style={{ color: "var(--orange)" }}>
              {formatarMoeda(m.realizadoHoje)}
            </p>
          </div>
          <CircularProgress pct={m.pctDiario} />
        </div>
        <div
          className="mt-auto rounded-lg px-3 py-2 text-xs font-semibold"
          style={{
            background: `color-mix(in oklab, ${colorHexFromPercent(m.pctDiario)} 16%, transparent)`,
            color: colorHexFromPercent(m.pctDiario),
          }}
        >
          {m.difDiario >= 0 ? "+" : "-"}
          {formatarMoeda(Math.abs(m.difDiario))} ({statusTexto(m.pctDiario, "diário")})
        </div>
      </Card>

      {/* Ritmo Necessário */}
      <Card accent="purple" icon={<Gauge size={18} />} title="Ritmo Necessário">
        <div className="flex flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Faltam</p>
            <p className="font-display text-2xl font-bold leading-tight">{formatarMoeda(m.faltaMensal)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Dias úteis restantes</p>
            <p className="font-display text-3xl font-bold leading-tight">{m.diasUteisRestantes}</p>
          </div>
          <span
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
            style={{ background: "color-mix(in oklab, var(--purple) 18%, transparent)", color: "var(--purple)" }}
          >
            <TrendingUp size={30} />
          </span>
        </div>
        <div
          className="mt-auto rounded-xl px-3 py-2.5 text-center"
          style={{ background: "color-mix(in oklab, var(--purple) 14%, transparent)" }}
        >
          <p className="text-[11px] text-muted-foreground">Necessário vender</p>
          <p className="font-display text-xl font-bold" style={{ color: "var(--purple)" }}>
            {formatarMoeda(m.necessarioPorDia)}/dia
          </p>
          <p className="text-[11px] text-muted-foreground">para bater o desafio</p>
        </div>
      </Card>
    </div>
  );
}

function Bar({ pct }: { pct: number }) {
  const color = colorHexFromPercent(pct);
  return (
    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/8">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(2, Math.min(100, pct))}%`,
          background: color,
          boxShadow: `0 0 10px ${color}aa`,
          transition: "width 1s cubic-bezier(0.22,1,0.36,1), background 0.6s",
        }}
      />
    </div>
  );
}

function StatusLine({ pct, escopo }: { pct: number; escopo: string }) {
  return (
    <p className="mt-2 text-[11px]" style={{ color: colorHexFromPercent(pct) }}>
      {statusTexto(pct, escopo)} · {formatarPercentual(pct)} atingido
    </p>
  );
}
