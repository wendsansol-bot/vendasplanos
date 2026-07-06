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
  name: "get_sales_metrics",
  title: "Get sales metrics",
  description:
    "Retorna as métricas do dashboard de vendas (previsto x realizado) para um mês e ano — desafio mensal, realizado, percentual atingido, ritmo diário/semanal e resumo.",
  inputSchema: {
    mes: z
      .string()
      .optional()
      .describe(
        'Nome do mês em português (ex.: "Julho"). Se omitido, usa o mês atual.',
      ),
    ano: z
      .string()
      .optional()
      .describe('Ano (ex.: "2026"). Se omitido, usa o ano atual.'),
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
    const summary = {
      mes: filters.mes,
      ano: filters.ano,
      desafioMensal: m.desafioMensal,
      realizadoMes: m.realizadoMes,
      pctMensal: Math.round(m.pctMensal * 10) / 10,
      faltaMensal: m.faltaMensal,
      realizadoSemana: m.realizadoSemana,
      pctSemanal: Math.round(m.pctSemanal * 10) / 10,
      realizadoHoje: m.realizadoHoje,
      diasUteisRestantes: m.diasUteisRestantes,
      necessarioPorDia: Math.round(m.necessarioPorDia * 100) / 100,
      ticketMedio: Math.round(m.ticketMedio * 100) / 100,
      qtdVendas: m.qtdVendas,
      melhorDia: m.melhorDiaLabel,
    };
    const text = [
      `Vendas de ${filters.mes}/${filters.ano}`,
      `Desafio mensal: ${formatarMoeda(m.desafioMensal)}`,
      `Realizado: ${formatarMoeda(m.realizadoMes)} (${summary.pctMensal}%)`,
      `Falta: ${formatarMoeda(m.faltaMensal)}`,
      `Necessário por dia útil restante: ${formatarMoeda(m.necessarioPorDia)} (${m.diasUteisRestantes} dias)`,
      `Ticket médio: ${formatarMoeda(m.ticketMedio)} · Qtd vendas: ${m.qtdVendas}`,
    ].join("\n");
    return {
      content: [{ type: "text", text }],
      structuredContent: { summary },
    };
  },
});
