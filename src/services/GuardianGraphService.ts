import { Commitment, CommitmentStatus, riskMatrixScore } from '../models/Commitment';

export type GraphEdgeKind = 'EXPLICIT_DEPENDENCY' | 'IMPLICIT_CORRELATION';

export interface GraphCorrelationEdge {
    id: string;
    sourceId: string;
    targetId: string;
    kind: GraphEdgeKind;
    confidence: number;
    reasons: string[];
}

export interface GraphCascadeCluster {
    projeto: string;
    commitmentIds: string[];
    unstableSignals: number;
    severity: 'HIGH' | 'MEDIUM';
    why: string;
}

export interface GraphAnalysisResult {
    generatedAt: Date;
    edges: GraphCorrelationEdge[];
    clusters: GraphCascadeCluster[];
    why: string;
}

export type GraphEngineRunResult = {
    status: 'ok';
    mode: 'deterministic' | 'hybrid';
    result: GraphAnalysisResult;
};

const isActive = (commitment: Commitment): boolean =>
    commitment.status === CommitmentStatus.BACKLOG || commitment.status === CommitmentStatus.ACTIVE;

const startOfDay = (value: Date): Date => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const daysDiff = (a: Date, b: Date): number => {
    const ms = Math.abs(startOfDay(a).getTime() - startOfDay(b).getTime());
    return Math.floor(ms / (1000 * 60 * 60 * 24));
};

const hasOpenHighRisk = (commitment: Commitment): boolean =>
    (commitment.riscos || []).some(risk =>
        (risk.statusMitigacao === 'ABERTO' || risk.statusMitigacao === 'EM_MITIGACAO')
        && riskMatrixScore(risk) >= 6,
    );

function unstableSignals(commitment: Commitment, today: Date): number {
    const due = startOfDay(new Date(commitment.dataEsperada));
    let score = 0;
    if (due < today) score += 1;
    if (commitment.hasImpedimento) score += 1;
    if ((commitment.renegociadoCount || 0) >= 2) score += 1;
    if (hasOpenHighRisk(commitment)) score += 1;
    return score;
}

export function buildDeterministicGraph(commitments: Commitment[], now: Date = new Date()): GraphAnalysisResult {
    const active = commitments.filter(isActive);
    const byId = new Map(active.map(commitment => [commitment.id, commitment]));
    const today = startOfDay(now);
    const edges: GraphCorrelationEdge[] = [];
    const seen = new Set<string>();

    active.forEach(commitment => {
        (commitment.dependencias || []).forEach(depId => {
            const dep = byId.get(depId);
            if (!dep) return;
            const key = `EXPLICIT:${dep.id}->${commitment.id}`;
            if (seen.has(key)) return;
            seen.add(key);
            edges.push({
                id: key,
                sourceId: dep.id,
                targetId: commitment.id,
                kind: 'EXPLICIT_DEPENDENCY',
                confidence: 1,
                reasons: ['Dependência explícita cadastrada no compromisso'],
            });
        });
    });

    for (let i = 0; i < active.length; i += 1) {
        for (let j = i + 1; j < active.length; j += 1) {
            const a = active[i];
            const b = active[j];

            const explicitBetween = (a.dependencias || []).includes(b.id) || (b.dependencias || []).includes(a.id);
            if (explicitBetween) continue;

            let confidence = 0;
            const reasons: string[] = [];
            if (a.projeto && b.projeto && a.projeto === b.projeto) {
                confidence += 0.35;
                reasons.push('Mesmo projeto');
            }
            if (a.owner && b.owner && a.owner === b.owner) {
                confidence += 0.2;
                reasons.push('Mesmo owner');
            }
            if (a.stakeholder && b.stakeholder && a.stakeholder === b.stakeholder) {
                confidence += 0.15;
                reasons.push('Mesmo stakeholder');
            }
            const diff = daysDiff(new Date(a.dataEsperada), new Date(b.dataEsperada));
            if (diff <= 3) {
                confidence += 0.2;
                reasons.push('Datas esperadas muito próximas');
            } else if (diff <= 7) {
                confidence += 0.1;
                reasons.push('Datas esperadas na mesma janela semanal');
            }
            if ((a.impacto === 'HIGH' || a.impacto === 'CRITICAL') && (b.impacto === 'HIGH' || b.impacto === 'CRITICAL')) {
                confidence += 0.1;
                reasons.push('Alto impacto sistêmico nos dois compromissos');
            }
            if (hasOpenHighRisk(a) || hasOpenHighRisk(b)) {
                confidence += 0.1;
                reasons.push('Risco alto aberto em pelo menos um compromisso');
            }

            if (confidence < 0.55) continue;

            const sourceFirst = new Date(a.dataEsperada).getTime() <= new Date(b.dataEsperada).getTime();
            const sourceId = sourceFirst ? a.id : b.id;
            const targetId = sourceFirst ? b.id : a.id;
            const key = `IMPLICIT:${sourceId}->${targetId}`;
            if (seen.has(key)) continue;
            seen.add(key);

            edges.push({
                id: key,
                sourceId,
                targetId,
                kind: 'IMPLICIT_CORRELATION',
                confidence: Math.min(0.95, Number(confidence.toFixed(2))),
                reasons,
            });
        }
    }

    const byProject = active.reduce((acc, commitment) => {
        if (!acc[commitment.projeto]) acc[commitment.projeto] = [];
        acc[commitment.projeto].push(commitment);
        return acc;
    }, {} as Record<string, Commitment[]>);

    const clusters: GraphCascadeCluster[] = Object.entries(byProject)
        .map(([projeto, projectCommitments]) => {
            const signals = projectCommitments.reduce((sum, commitment) => sum + unstableSignals(commitment, today), 0);
            if (projectCommitments.length < 2 || signals < 2) return null;

            return {
                projeto,
                commitmentIds: projectCommitments.map(commitment => commitment.id),
                unstableSignals: signals,
                severity: signals >= 4 ? 'HIGH' : 'MEDIUM',
                why: `Projeto com ${signals} sinais de instabilidade distribuídos em ${projectCommitments.length} compromisso(s) ativo(s).`,
            };
        })
        .filter((cluster): cluster is GraphCascadeCluster => cluster !== null)
        .sort((a, b) => b.unstableSignals - a.unstableSignals);

    const sortedEdges = edges
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 20);

    return {
        generatedAt: new Date(now),
        edges: sortedEdges,
        clusters,
        why: 'Correlação gerada por heurísticas determinísticas (dependência explícita + sinais de proximidade/risco).',
    };
}

export async function analyzeCommitmentGraph(commitments: Commitment[], now: Date = new Date()): Promise<GraphEngineRunResult> {
    const deterministic = buildDeterministicGraph(commitments, now);
    const enabled = process.env.NEXT_PUBLIC_FLOW_GUARDIAN_ENABLED === 'true';
    if (!enabled || !process.env.OPENAI_API_KEY) {
        return { status: 'ok', mode: 'deterministic', result: deterministic };
    }

    // v1: keep deterministic output as source of truth; AI validation layer will be added incrementally.
    return { status: 'ok', mode: 'deterministic', result: deterministic };
}
