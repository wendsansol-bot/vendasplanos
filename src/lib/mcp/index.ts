import { defineMcp } from "@lovable.dev/mcp-js";
import getSalesMetricsTool from "./tools/get-sales-metrics";
import getPlanRankingTool from "./tools/get-plan-ranking";
import getWeeklyEvolutionTool from "./tools/get-weekly-evolution";

export default defineMcp({
  name: "meta-de-vendas-mcp",
  title: "Meta de Vendas MCP",
  version: "0.1.0",
  instructions:
    "Ferramentas do dashboard Meta de Vendas (Sansol). Use `get_sales_metrics` para métricas mensais previsto x realizado, `get_plan_ranking` para o ranking de planos por faturamento e `get_weekly_evolution` para a evolução semanal. Todos aceitam `mes` (nome em português) e `ano`.",
  tools: [getSalesMetricsTool, getPlanRankingTool, getWeeklyEvolutionTool],
});
