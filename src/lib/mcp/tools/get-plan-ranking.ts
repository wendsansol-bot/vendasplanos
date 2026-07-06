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
  name: "get_plan_ranking",
  title: "Get plan ranking",
  description:
    "Retorna o ranking de planos por faturamento para um mês/ano — posição, plano, quantidade, faturamento e participação.",
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
    const ranking = m.planos.map((p) => ({
      posicao: p.posicao,
      plano: p.plano,
      qtd: p.qtd,
      faturamento: p.faturamento,
      participacao: Math.round(p.participacao * 10) / 10,
    }));
    const text = ranking.length
      ? ranking
          .map(
            (p) =>
              `${p.posicao}. ${p.plano} — ${formatarMoeda(p.faturamento)} (${p.qtd} vendas, ${p.participacao}%)`,
          )
          .join("\n")
      : "Nenhuma venda registrada para o período selecionado.";
    return {
      content: [{ type: "text", text }],
      structuredContent: { ranking },
    };
  },
});
