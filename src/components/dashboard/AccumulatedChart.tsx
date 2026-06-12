import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatarMoeda } from "@/lib/dashboard";
import type { AccumPoint } from "@/lib/metrics";

const GREEN = "#35c94a";
const GRID = "rgba(255,255,255,0.07)";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="mb-1 font-semibold">Dia {label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatarMoeda(p.value)}
        </p>
      ))}
    </div>
  );
}

export function AccumulatedChart({ data }: { data: AccumPoint[] }) {
  const hojeDia = data.find((d) => d.hoje)?.dia;
  const lastReal = [...data].reverse().find((d) => d.realizado != null);
  const lastMeta = data[data.length - 1];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-5">
        <h3 className="font-display text-base font-bold uppercase tracking-wide">
          Previsto x Realizado Acumulado (Mensal)
        </h3>
        <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-muted-foreground" /> Desafio acumulado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 rounded" style={{ background: GREEN }} /> Realizado acumulado
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 56, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="realArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
                <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="dia"
              tick={{ fill: "#aeb9cc", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              interval={0}
              minTickGap={2}
            />
            <YAxis
              tick={{ fill: "#aeb9cc", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => new Intl.NumberFormat("pt-BR").format(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            {hojeDia != null && (
              <ReferenceLine x={hojeDia} stroke={GREEN} strokeDasharray="4 4" strokeOpacity={0.5} />
            )}
            <Area
              type="monotone"
              dataKey="realizado"
              stroke="transparent"
              fill="url(#realArea)"
              connectNulls
              isAnimationActive
            />
            <Line
              type="monotone"
              dataKey="meta"
              name="Desafio acumulado"
              stroke="#aeb9cc"
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="realizado"
              name="Realizado acumulado"
              stroke={GREEN}
              strokeWidth={3}
              dot={{ r: 2.5, fill: GREEN, strokeWidth: 0 }}
              connectNulls
              label={(props: any) => {
                if (lastReal && props.index === lastReal.dia - 1 && props.value != null) {
                  return (
                    <text x={props.x + 8} y={props.y} fill={GREEN} fontSize={12} fontWeight={700}>
                      {new Intl.NumberFormat("pt-BR").format(props.value)}
                    </text>
                  );
                }
                return <g />;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-end pr-2 text-xs">
        <span className="text-muted-foreground">
          Desafio final:{" "}
          <span className="font-semibold text-foreground">
            {new Intl.NumberFormat("pt-BR").format(lastMeta?.meta ?? 0)}
          </span>
        </span>
      </div>
    </div>
  );
}
