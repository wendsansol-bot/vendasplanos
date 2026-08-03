import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  defaultFilters,
  fetchSheet,
  triggerMakeRefresh,
  type Filters,
  type SaleRow,
} from "@/lib/dashboard";
import { computeMetrics, uniqueValues } from "@/lib/metrics";
import { Header } from "@/components/dashboard/Header";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { AccumulatedChart } from "@/components/dashboard/AccumulatedChart";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { PlanoRanking } from "@/components/dashboard/PlanoRanking";
import { WeeklyTable } from "@/components/dashboard/WeeklyTable";
import { MonthSummary } from "@/components/dashboard/MonthSummary";
import { OrigemVendas } from "@/components/dashboard/OrigemVendas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meta de Vendas · Previsto x Realizado | Sansol" },
      {
        name: "description",
        content:
          "Dashboard executivo de vendas Sansol — acompanhamento de desafios previsto x realizado em tempo real.",
      },
      { property: "og:title", content: "Meta de Vendas · Previsto x Realizado | Sansol" },
      {
        property: "og:description",
        content: "Dashboard executivo de vendas Sansol — desafios mensal, semanal e diário.",
      },
    ],
  }),
  component: Dashboard,
});

type RefreshState = "idle" | "loading" | "success" | "error";

const WAIT_MS = 30_000;

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card-surface overflow-hidden p-4 ${className}`}>{children}</div>;
}

function Dashboard() {
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [filters, setFilters] = useState<Filters>(() => defaultFilters());
  const [refreshState, setRefreshState] = useState<RefreshState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    const data = await fetchSheet();
    setRows(data);
  }, []);

  useEffect(() => {
    loadData().catch(() => {
      /* fallback simulado é usado automaticamente */
    });
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setRefreshState("loading");
    setStatusMessage("Atualizando dados...");
    try {
      await triggerMakeRefresh();
      await new Promise((r) => setTimeout(r, WAIT_MS));
      await loadData();
      setRefreshState("success");
      setStatusMessage("Dados atualizados com sucesso.");
    } catch {
      setRefreshState("error");
      setStatusMessage("Não foi possível atualizar os dados agora. Verifique a planilha ou tente novamente.");
    }
    resetTimer.current = setTimeout(() => {
      setRefreshState("idle");
      setStatusMessage("");
    }, 6000);
  }, [loadData]);

  const filterOptions = useMemo(() => {
    const anos = new Set<string>();
    rows.forEach((r) => {
      if (r.date) anos.add(String(r.date.getFullYear()));
    });
    anos.add(String(new Date().getFullYear()));
    return {
      ano: Array.from(anos).sort((a, b) => Number(b) - Number(a)),
      responsavel: uniqueValues(rows, "responsavel"),
      empresa: uniqueValues(rows, "empresa"),
      cidade: uniqueValues(rows, "cidade"),
      plano: uniqueValues(rows, "plano"),
      pagamento: uniqueValues(rows, "pagamento"),
    };
  }, [rows]);

  const metrics = useMemo(() => computeMetrics(rows, filters), [rows, filters]);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);



  return (
    <div className="mx-auto flex h-screen max-h-[1080px] w-screen max-w-[1920px] flex-col gap-3 overflow-hidden p-4"
      style={{ background: "var(--surface-gradient)", backgroundColor: "#070b14" }}
    >
      <Header onRefresh={handleRefresh} refreshState={refreshState} statusMessage={statusMessage} />

      <FilterBar filters={filters} options={filterOptions} onChange={handleFilterChange} />

      <section className="h-[214px] shrink-0">
        <KpiCards m={metrics} />
      </section>

      <section className="grid min-h-0 flex-1 grid-cols-[1.62fr_1fr] gap-3">
        <Panel>
          <AccumulatedChart data={metrics.acumulado} />
        </Panel>
        <Panel className="flex flex-col">
          <h3 className="mb-1 font-display text-base font-bold uppercase tracking-wide">
            Velocímetro do Desafio (Mensal)
          </h3>
          <div className="min-h-0 flex-1">
            <GaugeChart pct={metrics.pctMensal} />
          </div>
        </Panel>
      </section>

      <section className="grid min-h-0 flex-1 grid-cols-4 gap-3">
        <Panel>
          <PlanoRanking planos={metrics.planos} />
        </Panel>
        <Panel>
          <WeeklyTable semanas={metrics.semanas} />
        </Panel>
        <Panel>
          <OrigemVendas origens={metrics.origens} />
        </Panel>
        <Panel>
          <MonthSummary m={metrics} />
        </Panel>
      </section>
    </div>
  );
}
