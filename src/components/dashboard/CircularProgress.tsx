import { colorHexFromPercent, formatarPercentual } from "@/lib/dashboard";

interface Props {
  pct: number;
  size?: number;
  stroke?: number;
  label?: string;
  decimals?: number;
}

export function CircularProgress({ pct, size = 96, stroke = 9, label = "Atingido", decimals = 0 }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c - (clamped / 100) * c;
  const color = colorHexFromPercent(pct);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1), stroke 0.6s",
            filter: `drop-shadow(0 0 6px ${color}aa)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold leading-none"
          style={{ color, fontSize: size * 0.24 }}
        >
          {formatarPercentual(pct, decimals)}
        </span>
        <span className="text-muted-foreground" style={{ fontSize: size * 0.11 }}>
          {label}
        </span>
      </div>
    </div>
  );
}
