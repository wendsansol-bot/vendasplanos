import { Filter, RefreshCw, CalendarClock } from "lucide-react";
import logo from "@/assets/sansol-logo.png.asset.json";

type RefreshState = "idle" | "loading" | "success" | "error";

interface Props {
  onRefresh: () => void;
  refreshState: RefreshState;
  statusMessage: string;
}

const STATUS_COLOR: Record<RefreshState, string> = {
  idle: "var(--muted-foreground)",
  loading: "var(--blue)",
  success: "var(--green)",
  error: "var(--red)",
};

function todayLabel() {
  const d = new Date();
  const data = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const dia = d.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${data} (${dia.charAt(0).toUpperCase()}${dia.slice(1)})`;
}

export function Header({ onRefresh, refreshState, statusMessage }: Props) {
  return (
    <header className="grid grid-cols-[auto_1fr_auto] items-center gap-5">
      <div className="flex items-center gap-4">
        <img src={logo.url} alt="Sansol Engenharia Solar" className="h-12 w-auto shrink-0 object-contain" />
        <div className="h-10 w-px bg-border" />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold leading-none tracking-tight glow-text">
            META DE VENDAS
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Previsto x Realizado
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {statusMessage && (
          <span
            className="hidden text-sm font-medium lg:inline"
            style={{ color: STATUS_COLOR[refreshState] }}
          >
            {statusMessage}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm">
          <CalendarClock size={16} className="text-brand" />
          <span className="text-muted-foreground">Data atual:</span>
          <span className="font-semibold">{todayLabel()}</span>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Filter size={16} /> Filtros
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshState === "loading"}
          className="flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/15 px-4 py-2.5 text-sm font-semibold text-brand transition-all hover:bg-brand/25 disabled:opacity-70"
        >
          <RefreshCw size={16} className={refreshState === "loading" ? "animate-spin" : ""} />
          {refreshState === "loading" ? "Atualizando..." : "Atualizar dados"}
        </button>
      </div>
    </header>
  );
}
