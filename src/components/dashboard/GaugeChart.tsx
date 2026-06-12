import { colorHexFromPercent, formatarPercentual, statusTexto } from "@/lib/dashboard";

interface Props {
  pct: number;
}

const START = -90; // graus, semicírculo da esquerda
const END = 90;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, startA: number, endA: number) {
  const s = polar(cx, cy, r, startA);
  const e = polar(cx, cy, r, endA);
  const large = endA - startA <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function GaugeChart({ pct }: Props) {
  const w = 360;
  const h = 210;
  const cx = w / 2;
  const cy = h - 24;
  const r = 140;
  const clamped = Math.max(0, Math.min(100, pct));
  const valueAngle = START + (clamped / 100) * (END - START);
  const color = colorHexFromPercent(pct);
  const needle = polar(cx, cy, r - 14, valueAngle);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[440px]">
        {/* trilho de fundo */}
        <path
          d={arcPath(cx, cy, r, START, END)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={22}
          strokeLinecap="round"
        />
        {/* arco preenchido dinâmico (cor por percentual) */}
        <path
          d={arcPath(cx, cy, r, START, valueAngle)}
          fill="none"
          stroke={color}
          strokeWidth={22}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 10px ${color}99)`, transition: "all 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
        {/* ponteiro */}
        <line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          style={{ transition: "all 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
        <circle cx={cx} cy={cy} r={11} fill={color} />
        <circle cx={cx} cy={cy} r={5} fill="#0a0f1f" />
        {/* escala */}
        <text x={polar(cx, cy, r + 20, START).x - 4} y={cy + 6} className="fill-muted-foreground" fontSize="14" textAnchor="middle">0%</text>
        <text x={cx} y={cy - r - 14} className="fill-muted-foreground" fontSize="14" textAnchor="middle">50%</text>
        <text x={polar(cx, cy, r + 20, END).x + 6} y={cy + 6} className="fill-muted-foreground" fontSize="14" textAnchor="middle">100%</text>
      </svg>
      <div className="-mt-10 flex flex-col items-center">
        <span className="font-display text-5xl font-extrabold glow-text" style={{ color }}>
          {formatarPercentual(pct, 2)}
        </span>
        <span className="text-sm text-muted-foreground">{statusTexto(pct, "mensal")}</span>
      </div>
    </div>
  );
}
