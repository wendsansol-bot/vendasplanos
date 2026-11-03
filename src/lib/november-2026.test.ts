import { test } from "node:test";
import assert from "node:assert/strict";
import { getMetasDoMes, getPeriodo, SEMANAS_POR_MES, INICIO_GRAFICO_POR_MES, type SaleRow, type Filters } from "./dashboard";
import { computeMetrics } from "./metrics";

const filters: Filters = { mes: "Novembro", ano: "2026", responsavel: "Todos", empresa: "Todas", cidade: "Todas", plano: "Todos", pagamento: "Todos" };
const sale = (month: number, day: number, valor: number, responsavel = "Ana"): SaleRow => ({ date: new Date(2026, month, day), valor, plano: "OURO", responsavel, empresa: "Sansol", cidade: "Teste", pagamento: "Pix" });

test("November monthly target and challenge are 40000", () => {
  assert.equal(getMetasDoMes(2026, 10).mensal, 40000);
  assert.equal(computeMetrics([], filters).desafioMensal, 40000);
});
test("November weekly target is 10000", () => {
  assert.equal(getMetasDoMes(2026, 10).semanal, 10000);
  assert.ok(computeMetrics([], filters).semanas.every(w => w.desafio === 10000));
});
test("November daily target rounds to 1666.67", () => {
  assert.equal(Number(getMetasDoMes(2026, 10).diario.toFixed(2)), 1666.67);
});
for (const [index, start, end] of [[0, 3, 7], [1, 9, 14], [2, 16, 21], [3, 23, 30]]) {
  test(`November week ${index + 1} includes only its configured dates`, () => {
    assert.deepEqual(SEMANAS_POR_MES["2026-11"][index], { label: `Semana ${index + 1}`, start: [10, start], end: [10, end] });
    const m = computeMetrics([sale(10, start - 1, 800), sale(10, start, 100), sale(10, end, 200), sale(10, end + 1, 900)], filters);
    assert.equal(m.semanas[index].realizado, 300);
  });
}
test("November chart runs from November 3 to 30 without earlier sales or simulated values", () => {
  const m = computeMetrics([sale(10, 1, 1000), sale(10, 2, 2000), sale(10, 3, 100)], filters);
  assert.deepEqual(m.acumulado.map(p => p.dia), Array.from({ length: 28 }, (_, i) => i + 3));
  assert.equal(m.acumulado[0].realizado, 100);
  assert.equal(m.acumulado[27].meta, 40000);
  const empty = computeMetrics([], filters);
  assert.equal(empty.isSimulated, false);
  assert.equal(empty.realizadoMes, 0);
  assert.ok(empty.acumulado.every(p => p.realizado === null || p.realizado === 0));
});
test("November indicators exclude other months and preserve existing filters", () => {
  const m = computeMetrics([sale(9, 31, 9000), sale(10, 1, 100), sale(10, 3, 200), sale(10, 3, 400, "Bia"), sale(10, 30, 300), sale(11, 1, 8000)], { ...filters, responsavel: "Ana" });
  assert.equal(m.realizadoMes, 600);
  assert.equal(m.qtdVendas, 3);
  assert.equal(m.ticketMedio, 200);
  assert.equal(m.planos[0].faturamento, 600);
  assert.equal(m.semanas[0].realizado, 200);
  assert.equal(m.semanas[3].realizado, 300);
});
test("October and September special closing remain unchanged", () => {
  assert.equal(INICIO_GRAFICO_POR_MES["2026-10"], 5);
  assert.deepEqual(SEMANAS_POR_MES["2026-10"].map(w => [w.start, w.end]), [[[9, 5], [9, 10]], [[9, 12], [9, 17]], [[9, 19], [9, 24]], [[9, 26], [9, 31]]]);
  assert.equal(getPeriodo(2026, 8).end.getTime(), new Date(2026, 9, 3, 23, 59, 59, 999).getTime());
  assert.equal(getPeriodo(2026, 9).start.getTime(), new Date(2026, 9, 4).getTime());
});