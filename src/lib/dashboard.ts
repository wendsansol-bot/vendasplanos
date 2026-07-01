// Core data layer for the META DE VENDAS dashboard.

export const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1HnYDs_jCm67cken5p3tQ3N_3v8NiORsjBNLCwXwypEk/gviz/tq?tqx=out:csv&gid=1638124845";

export const MAKE_WEBHOOK_URL =
  "https://hook.us1.make.com/zhgilgemm94769fx97nakeoobbqbvuv4";

// Business challenge configuration (not present in the sheet).
// Metas padrão (fallback quando o mês não estiver configurado abaixo).
export const DESAFIO_MENSAL = 40000;
export const DESAFIO_SEMANAL = 10000;
export const DESAFIO_DIARIO = DESAFIO_SEMANAL / 6; // 1666.67

// Nomes dos meses (índice 0 = Janeiro).
export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export interface MetaMensal {
  mensal: number;
  semanal: number;
  diario: number;
}

/**
 * Metas históricas por mês. Chave no formato "AAAA-MM" (mês de 01 a 12).
 * Para adicionar novos meses no futuro, basta acrescentar uma nova linha aqui.
 */
export const METAS_POR_MES: Record<string, { mensal: number; semanal: number }> = {
  "2026-06": { mensal: 40000, semanal: 10000 }, // Junho/2026
  "2026-07": { mensal: 50000, semanal: 12500 }, // Julho/2026
};

// Meta padrão usada quando o mês selecionado não estiver configurado acima.
export const META_PADRAO = { mensal: DESAFIO_MENSAL, semanal: DESAFIO_SEMANAL };

/** Retorna as metas (mensal/semanal/diária) do mês informado. */
export function getMetasDoMes(ano: number, mes0: number): MetaMensal {
  const key = `${ano}-${String(mes0 + 1).padStart(2, "0")}`;
  const base = METAS_POR_MES[key] ?? META_PADRAO;
  return { mensal: base.mensal, semanal: base.semanal, diario: base.semanal / 6 };
}

/** Converte o nome do mês para o índice 0-11 (fallback: mês atual). */
export function mesToIndex(nome: string): number {
  const i = MESES.indexOf(nome);
  return i >= 0 ? i : new Date().getMonth();
}

export interface SaleRow {
  valor: number;
  date: Date | null;
  plano: string;
  responsavel: string;
  empresa: string;
  cidade: string;
  pagamento: string;
}

export interface Filters {
  mes: string;
  ano: string;
  responsavel: string;
  empresa: string;
  cidade: string;
  plano: string;
  pagamento: string;
}

/** Filtros padrão: mês e ano atuais, demais em "Todos". */
export function defaultFilters(): Filters {
  const now = new Date();
  return {
    mes: MESES[now.getMonth()],
    ano: String(now.getFullYear()),
    responsavel: "Todos",
    empresa: "Todas",
    cidade: "Todas",
    plano: "Todos",
    pagamento: "Todos",
  };
}

/* ----------------------------- Formatting ----------------------------- */

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor || 0);
}

export function formatarPercentual(valor: number, decimals = 0): string {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(valor || 0)}%`;
}

/* --------------------------- Color by percent ------------------------- */

export type StatusColor = "red" | "yellow" | "green";

export function statusFromPercent(pct: number): StatusColor {
  if (pct >= 100) return "green";
  if (pct >= 80) return "yellow";
  return "red";
}

export const COLOR_HEX: Record<StatusColor, string> = {
  red: "#ff3b30",
  yellow: "#facc15",
  green: "#35c94a",
};

export function colorHexFromPercent(pct: number): string {
  return COLOR_HEX[statusFromPercent(pct)];
}

/** Texto padrão de acima/abaixo do desafio. */
export function statusTexto(pct: number, escopo: string): string {
  const rounded = Math.round(pct);
  if (rounded === 100) return "Desafio atingido";
  if (rounded < 100) return `${100 - rounded}% abaixo do desafio ${escopo}`;
  return `${rounded - 100}% acima do desafio ${escopo}`;
}

/* ------------------------------ Parsing ------------------------------ */

/** Converte valores BR e US ("$803.33", "1.199,99", "R$ 1.199,99"). */
export function parseValor(raw: unknown): number {
  if (raw == null) return 0;
  if (typeof raw === "number") return raw;
  let s = String(raw).trim();
  if (!s) return 0;
  s = s.replace(/[R$\s]/gi, "").replace(/[^\d.,-]/g, "");
  if (!s) return 0;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  if (hasComma && hasDot) {
    // O último separador é o decimal.
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(",", ".");
  } else if (hasDot) {
    // Apenas ponto: decimal (2 casas) ou milhar (3 casas).
    const after = s.split(".").pop() ?? "";
    if (after.length === 3 && s.split(".").length === 2) {
      s = s.replace(/\./g, ""); // milhar: "1.199" -> 1199
    }
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

/** Interpreta DATA_VENDA_OK em vários formatos. Ignora DATA VENDA. */
export function parseData(raw: unknown): Date | null {
  if (raw == null) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;
  const s = String(raw).trim();
  if (!s) return null;

  // dd/mm/yyyy (com hora opcional)
  const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (br) {
    const [, d, m, y, hh, mm, ss] = br;
    const date = new Date(+y, +m - 1, +d, +(hh ?? 0), +(mm ?? 0), +(ss ?? 0));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // yyyy-mm-dd
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const [, y, m, d] = iso;
    const date = new Date(+y, +m - 1, +d);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallback = new Date(s);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/* ------------------------------ CSV ------------------------------ */

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function normalizeKey(k: string): string {
  return k
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

const PLANO_KEYS = ["PLANO", "TIPO_PLANO", "TIPO_DE_PLANO", "TIPO_DE_SERVICO"];

export function parseSheet(csvText: string): SaleRow[] {
  const matrix = parseCsv(csvText);
  if (matrix.length < 2) return [];
  const header = matrix[0].map(normalizeKey);

  const idx = (candidates: string[]) =>
    candidates.map((c) => header.indexOf(c)).find((i) => i >= 0) ?? -1;

  const iValor = idx(["VALOR"]);
  const iData = idx(["DATA_VENDA_OK"]);
  const iPlano = idx(PLANO_KEYS);
  const iResp = idx(["RESP_VENDA", "RESPONSAVEL", "RESP"]);
  const iEmpresa = idx(["EMPRESA"]);
  const iCidade = idx(["CIDADE"]);
  const iPagamento = idx(["PAGAMENTO"]);

  const out: SaleRow[] = [];
  for (let r = 1; r < matrix.length; r++) {
    const cols = matrix[r];
    if (!cols || cols.length === 0) continue;
    const valor = iValor >= 0 ? parseValor(cols[iValor]) : 0;
    const date = iData >= 0 ? parseData(cols[iData]) : null;
    if (valor === 0 && !date) continue;
    out.push({
      valor,
      date,
      plano: (iPlano >= 0 ? cols[iPlano] : "").trim() || "Sem plano",
      responsavel: (iResp >= 0 ? cols[iResp] : "").trim(),
      empresa: (iEmpresa >= 0 ? cols[iEmpresa] : "").trim(),
      cidade: (iCidade >= 0 ? cols[iCidade] : "").trim(),
      pagamento: (iPagamento >= 0 ? cols[iPagamento] : "").trim(),
    });
  }
  return out;
}

export async function fetchSheet(): Promise<SaleRow[]> {
  const separator = SHEET_CSV_URL.includes("?") ? "&" : "?";
  const url = `${SHEET_CSV_URL}${separator}cacheBust=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Falha ao carregar planilha (${res.status})`);
  const text = await res.text();
  return parseSheet(text);
}

export async function triggerMakeRefresh(): Promise<void> {
  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      cache: "no-store",
    });
  } catch {
    // no-cors: ignoramos o resultado, o Make é acionado em segundo plano.
  }
}
