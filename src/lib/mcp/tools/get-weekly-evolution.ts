import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  defaultFilters,
  fetchSheet,
  formatarMoeda,
  type Filters,
} from "@/lib/dashboard";
import { computeMetrics } from "@/lib/metrics";

export default defineTool({
  name: "get_weekly_evolution",
  title: "Get weekly evolution",
  description:
    "Retorna a evolução semanal de vendas (desafio x realizado por semana) para um mês/ano.",
  inputSchema: {
    mes: z
      .string()
      .optional()
      .describe('Nome do mês em português (ex.: "Julho"). Padrão: mês atual.'),
    ano: z.string().optional().describe('Ano (ex.: "2026"). Padrão: ano atual.'),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ mes, ano }) => {
    const rows = await fetchSheet();
    const filters: Filters = {
      ...defaultFilters(),
      ...(mes ? { mes } : {}),
      ...(ano ? { ano } : {}),
    };
    const m = computeMetrics(rows, filters);
    const semanas = m.semanas.map((w) => ({
      semana: w.semana,
      periodo: w.periodo,
      desafio: w.desafio,
      realizado: w.realizado,
      pct: w.pct == null ? null : Math.round(w.pct * 10) / 10,
    }));
    const text = semanas
      .map(
        (w) =>
          `${w.semana} (${w.periodo}): ${w.realizado == null ? "—" : formatarMoeda(w.realizado)} de ${formatarMoeda(w.desafio)}${w.pct == null ? "" : ` (${w.pct}%)`}`,
      )
      .join("\n");
    return {
      content: [{ type: "text", text }],
      structuredContent: { semanas },
    };
  },
});
