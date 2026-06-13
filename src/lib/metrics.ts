import {
  DESAFIO_DIARIO,
  DESAFIO_MENSAL,
  DESAFIO_SEMANAL,
  type Filters,
  type SaleRow,
} from "./dashboard";

export interface AccumPoint {
  dia: number;
  meta: number;
  realizado: number | null;
  hoje: boolean;
}

export interface WeekRow {
  semana: string;
  periodo: string;
  desafio: number;
  realizado: number | null;
  pct: number | null;
}

export interface PlanoRow {
  posicao: number;
  plano: string;
  qtd: number;
  faturamento: number;
  participacao: number;
}

export interface Metrics {
  isSimulated: boolean;
  // Mensal
  desafioMensal: number;
  realizadoMes: number;
  pctMensal: number;
  faltaMensal: number;
  // Semanal
  desafioSemanal: number;
  realizadoSemana: number;
  pctSemanal: number;
  faltaSemanal: number;
  // Diário
  desafioDiario: number;
  realizadoHoje: number;
  pctDiario: number;
  difDiario: number;
  // Ritmo
  diasUteisRestantes: number;
  necessarioPorDia: number;
  // Charts/tables
  acumulado: AccumPoint[];
  semanas: WeekRow[];
  planos: PlanoRow[];
  // Resumo
  ticketMedio: number;
  qtdVendas: number;
  melhorDiaLabel: string;
  melhorDiaValor: number;
}

const MES_LABEL = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function businessDaysRemaining(today: Date): number {
  const year = today.getFullYear();
  const month = today.getMonth();
  // Conta do dia seguinte ao atual até o dia 30 do mês (incluindo o 30),
  // desconsiderando apenas os domingos. Sábado conta.
  const lastDay = Math.min(30, new Date(year, month + 1, 0).getDate());
  let count = 0;
  for (let d = today.getDate() + 1; d <= lastDay; d++) {
    const wd = new Date(year, month, d).getDay();
    if (wd !== 0) count++; // 0 = domingo
  }
  return count;
}

/* ------------------------- Simulated fallback ------------------------- */

export const SIMULATED: Metrics = {
  isSimulated: true,
  desafioMensal: 40000,
  realizadoMes: 27500,
  pctMensal: 68.75,
  faltaMensal: 12500,
  desafioSemanal: 10000,
  realizadoSemana: 7800,
  pctSemanal: 78,
  faltaSemanal: 2200,
  desafioDiario: 1666.67,
  realizadoHoje: 2100,
  pctDiario: 126,
  difDiario: 433.33,
  diasUteisRestantes: 8,
  necessarioPorDia: 1562.5,
  acumulado: (() => {
    const pts: AccumPoint[] = [];
    const total = 30;
    const hoje = 12;
    let acc = 0;
    for (let d = 1; d <= total; d++) {
      acc += d <= hoje ? 27500 / hoje : 0;
      pts.push({
        dia: d,
        meta: Math.round((40000 * d) / total),
        realizado: d <= hoje ? Math.round(acc) : null,
        hoje: d === hoje,
      });
    }
    return pts;
  })(),
  semanas: [
    { semana: "Semana 1", periodo: "01/06 - 06/06", desafio: 10000, realizado: 8500, pct: 85 },
    { semana: "Semana 2", periodo: "08/06 - 13/06", desafio: 10000, realizado: 12000, pct: 120 },
    { semana: "Semana 3", periodo: "15/06 - 20/06", desafio: 10000, realizado: 6000, pct: 60 },
    { semana: "Semana 4", periodo: "22/06 - 30/06", desafio: 10000, realizado: null, pct: null },
  ],
  planos: [
    { posicao: 1, plano: "Platinum", qtd: 18, faturamento: 22000, participacao: 45 },
    { posicao: 2, plano: "Ouro", qtd: 12, faturamento: 15000, participacao: 31 },
    { posicao: 3, plano: "Prata", qtd: 7, faturamento: 8500, participacao: 17 },
    { posicao: 4, plano: "Bronze", qtd: 3, faturamento: 3000, participacao: 7 },
  ],
  ticketMedio: 3750,
  qtdVendas: 34,
  melhorDiaLabel: "03/06/2025",
  melhorDiaValor: 2100,
};

/* --------------------------- Filtering --------------------------- */

export function applyFilters(rows: SaleRow[], f: Filters): SaleRow[] {
  return rows.filter((r) => {
    if (f.responsavel !== "Todos" && r.responsavel !== f.responsavel) return false;
    if (f.empresa !== "Todas" && r.empresa !== f.empresa) return false;
    if (f.cidade !== "Todas" && r.cidade !== f.cidade) return false;
    if (f.plano !== "Todos" && r.plano !== f.plano) return false;
    if (f.pagamento !== "Todos" && r.pagamento !== f.pagamento) return false;
    return true;
  });
}

export function uniqueValues(rows: SaleRow[], key: keyof SaleRow): string[] {
  const set = new Set<string>();
  rows.forEach((r) => {
    const v = String(r[key] ?? "").trim();
    if (v) set.add(v);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/* --------------------------- Week ranges --------------------------- */

function weekRanges(today: Date) {
  const y = today.getFullYear();
  const m = today.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  return [
    { label: "Semana 1", start: 1, end: 6 },
    { label: "Semana 2", start: 8, end: 13 },
    { label: "Semana 3", start: 15, end: 20 },
    { label: "Semana 4", start: 22, end: last },
  ].map((w) => ({
    ...w,
    startDate: new Date(y, m, w.start),
    endDate: new Date(y, m, w.end, 23, 59, 59),
  }));
}

const fmtDay = (d: number) => String(d).padStart(2, "0");

/* --------------------------- Main compute --------------------------- */

export function computeMetrics(allRows: SaleRow[], filters: Filters): Metrics {
  const rows = applyFilters(allRows, filters);
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const totalDays = new Date(y, m + 1, 0).getDate();
  const mm = fmtDay(m + 1);

  const inMonth = rows.filter((r) => r.date && r.date.getFullYear() === y && r.date.getMonth() === m);

  const realizadoMes = inMonth.reduce((s, r) => s + r.valor, 0);

  // Sem dados reais no mês -> usa simulação.
  if (realizadoMes <= 0) return SIMULATED;

  const desafioMensal = DESAFIO_MENSAL;
  const desafioSemanal = DESAFIO_SEMANAL;
  const desafioDiario = DESAFIO_DIARIO;

  const pctMensal = (realizadoMes / desafioMensal) * 100;
  const faltaMensal = Math.max(0, desafioMensal - realizadoMes);

  // Semana atual (definida pelos ranges fixos do mês)
  const ranges = weekRanges(today);
  const currentWeek = ranges.find(
    (w) => today >= w.startDate && today <= w.endDate,
  ) ?? ranges[ranges.length - 1];
  const realizadoSemana = inMonth
    .filter((r) => r.date! >= currentWeek.startDate && r.date! <= currentWeek.endDate)
    .reduce((s, r) => s + r.valor, 0);
  const pctSemanal = (realizadoSemana / desafioSemanal) * 100;
  const faltaSemanal = Math.max(0, desafioSemanal - realizadoSemana);

  // Hoje
  const realizadoHoje = inMonth
    .filter((r) => r.date!.getDate() === today.getDate())
    .reduce((s, r) => s + r.valor, 0);
  const pctDiario = (realizadoHoje / desafioDiario) * 100;
  const difDiario = realizadoHoje - desafioDiario;

  // Ritmo
  const diasUteisRestantes = businessDaysRemaining(today);
  const necessarioPorDia = diasUteisRestantes > 0 ? faltaMensal / diasUteisRestantes : 0;

  // Acumulado diário
  const perDay = new Array(totalDays + 1).fill(0);
  inMonth.forEach((r) => {
    perDay[r.date!.getDate()] += r.valor;
  });
  const acumulado: AccumPoint[] = [];
  let acc = 0;
  for (let d = 1; d <= totalDays; d++) {
    acc += perDay[d];
    acumulado.push({
      dia: d,
      meta: Math.round((desafioMensal * d) / totalDays),
      realizado: d <= today.getDate() ? Math.round(acc) : null,
      hoje: d === today.getDate(),
    });
  }

  // Evolução semanal
  const semanas: WeekRow[] = ranges.map((w) => {
    const real = inMonth
      .filter((r) => r.date! >= w.startDate && r.date! <= w.endDate)
      .reduce((s, r) => s + r.valor, 0);
    const future = w.startDate > today;
    return {
      semana: w.label,
      periodo: `${fmtDay(w.start)}/${mm} - ${fmtDay(w.end)}/${mm}`,
      desafio: desafioSemanal,
      realizado: future && real === 0 ? null : real,
      pct: future && real === 0 ? null : (real / desafioSemanal) * 100,
    };
  });

  // Ranking por tipo de plano
  const grupos = new Map<string, { qtd: number; fat: number }>();
  inMonth.forEach((r) => {
    const key = r.plano || "Sem plano";
    const g = grupos.get(key) ?? { qtd: 0, fat: 0 };
    g.qtd += 1;
    g.fat += r.valor;
    grupos.set(key, g);
  });
  const planos: PlanoRow[] = Array.from(grupos.entries())
    .map(([plano, g]) => ({ plano, qtd: g.qtd, faturamento: g.fat }))
    .sort((a, b) => b.faturamento - a.faturamento)
    .slice(0, 6)
    .map((p, i) => ({
      ...p,
      plano: titleCase(p.plano),
      posicao: i + 1,
      participacao: realizadoMes > 0 ? (p.faturamento / realizadoMes) * 100 : 0,
    }));

  // Resumo
  const qtdVendas = inMonth.length;
  const ticketMedio = qtdVendas > 0 ? realizadoMes / qtdVendas : 0;
  let melhorDia = 0;
  let melhorValor = 0;
  for (let d = 1; d <= totalDays; d++) {
    if (perDay[d] > melhorValor) {
      melhorValor = perDay[d];
      melhorDia = d;
    }
  }
  const melhorDiaLabel = melhorDia ? MES_LABEL(new Date(y, m, melhorDia)) : "—";

  return {
    isSimulated: false,
    desafioMensal,
    realizadoMes,
    pctMensal,
    faltaMensal,
    desafioSemanal,
    realizadoSemana,
    pctSemanal,
    faltaSemanal,
    desafioDiario,
    realizadoHoje,
    pctDiario,
    difDiario,
    diasUteisRestantes,
    necessarioPorDia,
    acumulado,
    semanas,
    planos,
    ticketMedio,
    qtdVendas,
    melhorDiaLabel,
    melhorDiaValor: melhorValor,
  };
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|\s|-)(\p{L})/gu, (_m, sep, ch) => sep + ch.toUpperCase());
}
