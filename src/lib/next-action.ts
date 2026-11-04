/**
 * D15-2a: próximo passo acionável (Home + /progress) por NECESSIDADE ATUAL.
 * Ranqueia por necessidade: severidade do lapso (queda entre tentativas,
 * peso 2×) + fraqueza atual (distância da última tentativa ao alvo 90),
 * ambos ponderados pela RECÊNCIA (meia-vida de 7 dias — treino antigo pesa
 * menos). Vocabulário vencido entra ponderado (8 pts por item, teto 15) —
 * não esmaga mais um lapso severo recente, mas vence fraquezas leves.
 * Desempate: tentativa mais recente primeiro; depois ordem alfabética do
 * tipo (decisão registrada no PRD, testada em proj15-fase2).
 * Puro; complementa (não substitui) a retomada de sessão/exame do Home.
 */
import { TYPE_META, metaByType, type TaskType } from "@/lib/pte";
import { vocabDueCount } from "@/lib/plus/vocab";
import { computeStats, type AppState, type Attempt } from "@/lib/storage";

const DAY = 86_400_000;
/** Alvo de fraqueza: última tentativa abaixo disso é necessidade. */
const TARGET = 90;
/** Meia-vida do peso de recência (dias): tentativa de 7 dias vale metade. */
const HALF_LIFE_DAYS = 7;
/** Queda entre tentativas pesa 2× a distância ao alvo (lapso é o sinal forte). */
const LAPSE_WEIGHT = 2;
/** Vocabulário: pontos de necessidade por item vencido. */
const VOCAB_POINT = 8;
/** Teto de itens vencidos contados (evita estourar a escala). */
const VOCAB_MAX_ITEMS = 15;

export interface NextAction {
  kind: "vocab" | "practice";
  title: string;
  detail: string;
  /** qid mais fraco quando kind === "practice" (abre direto a prática). */
  qid?: string;
  count: number;
}

interface TypeNeed {
  t: TaskType;
  /** Última tentativa com score do tipo. */
  latest: number;
  /** Tentativa anterior (null = sem lapso mensurável). */
  prev: number | null;
  /** Idade da última tentativa (dias). */
  ageDays: number;
  /** Tentativas com score do tipo. */
  n: number;
  /** Pontos de necessidade atuais. */
  need: number;
}

function typeNeeds(attempts: Attempt[], now: number): TypeNeed[] {
  const byType = new Map<
    TaskType,
    { latest: number; latestTs: number; prev: number | null; n: number }
  >();
  const ordered = [...attempts].sort((a, b) => a.ts - b.ts);
  for (const a of ordered) {
    const s = a.score ?? a.contentScore;
    if (s === null) continue;
    const cur = byType.get(a.taskType);
    if (!cur) byType.set(a.taskType, { latest: s, latestTs: a.ts, prev: null, n: 1 });
    else {
      cur.prev = cur.latest;
      cur.latest = s;
      cur.latestTs = a.ts;
      cur.n += 1;
    }
  }
  const out: TypeNeed[] = [];
  for (const [t, v] of byType) {
    const ageDays = Math.max(0, (now - v.latestTs) / DAY);
    const recency = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
    const weakness = Math.max(0, TARGET - v.latest);
    const lapse = v.prev === null ? 0 : Math.max(0, v.prev - v.latest);
    out.push({
      t,
      latest: v.latest,
      prev: v.prev,
      ageDays,
      n: v.n,
      need: (weakness + LAPSE_WEIGHT * lapse) * recency,
    });
  }
  return out;
}

export function buildNextAction(app: AppState, now = Date.now()): NextAction | null {
  const due = vocabDueCount(app.vocabulary, now);
  const vocabNeed = Math.min(due, VOCAB_MAX_ITEMS) * VOCAB_POINT;

  const needs = typeNeeds(app.attempts, now)
    .filter((r) => r.need > 0)
    .sort((a, b) => b.need - a.need || a.ageDays - b.ageDays || a.t.localeCompare(b.t));
  const stats = computeStats(app);
  const statsByType = new Map<TaskType, { tried: number; qid?: string }>();
  for (const t of needs.map((n) => n.t)) {
    const ids = new Set(metaByType(t).map((m) => m.id));
    let qid: string | undefined;
    let worstLast = Infinity;
    let worstBest = Infinity;
    let tried = 0;
    for (const [id, s] of stats) {
      if (!ids.has(id) || s.lastScore === null) continue;
      tried += 1;
      // Ação aponta para a fraqueza ATUAL: pior última nota; desempate pelo
      // pior melhor histórico (contexto rotulado em /progress — D15-2b).
      if (
        s.lastScore! < worstLast ||
        (s.lastScore === worstLast && (s.bestContent ?? 0) < worstBest)
      ) {
        worstLast = s.lastScore!;
        worstBest = s.bestContent ?? 0;
        qid = id;
      }
    }
    if (tried > 0) statsByType.set(t, { tried, ...(qid ? { qid } : {}) });
  }
  // Tipos medidos só por dados sem estatística não são recomendáveis.
  const weakest = needs.find((n) => statsByType.has(n.t));

  if (weakest && weakest.need > vocabNeed) {
    const info = statsByType.get(weakest.t)!;
    const mean = typeMean(app, weakest.t);
    const reason =
      weakest.prev !== null && weakest.prev > weakest.latest
        ? `piora recente de ${weakest.prev - weakest.latest} pts`
        : `média ${mean}% — o tipo mais fraco agora`;
    return {
      kind: "practice",
      count: info.tried,
      ...(info.qid ? { qid: info.qid } : {}),
      title: `Treinar ${TYPE_META[weakest.t].label}`,
      detail: `${weakest.n} tentativa${weakest.n === 1 ? "" : "s"} · última ${weakest.latest}%${
        weakest.prev !== null ? ` · antes ${weakest.prev}%` : ""
      } · média ${mean}% — ${reason}.`,
    };
  }

  if (due > 0) {
    return {
      kind: "vocab",
      count: due,
      title: `Revisar ${due} ${due === 1 ? "item vencido" : "itens vencidos"}`,
      detail: "A fila de revisão espaçada do vocabulário está pronta para hoje.",
    };
  }

  return null;
}

/** Média simples das tentativas com score do tipo. */
function typeMean(app: AppState, t: TaskType): number {
  const scores = app.attempts
    .map((a) => (a.taskType === t ? (a.score ?? a.contentScore) : null))
    .filter((s): s is number => s !== null);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}
