import { Commitment, CommitmentStatus, riskMatrixScore } from '../models/Commitment';

export type InsightSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface GuardianInsight {
    id: string;
    severity: InsightSeverity;
    headline: string;
    evidence: string;
    recommendedAction: string;
    why: string;
}

export interface OwnerSaturationSignal {
    owner: string;
    activeCount: number;
    overdueCount: number;
    blockedCount: number;
    highRiskOpenCount: number;
    recurrentCount: number;
    saturationScore: number;
}

export interface ProjectRiskSignal {
    projeto: string;
    activeCount: number;
    unstableSignals: number;
    highRiskOpenCount: number;
}

export interface IntegritySystemSignals {
    totals: {
        active: number;
        overdue: number;
        blocked: number;
        highRiskOpen: number;
        recurrent: number;
        checklistStalledNearDue: number;
        checklistInconsistency: number;
    };
    ownerSaturation: OwnerSaturationSignal[];
    projectRisk: ProjectRiskSignal[];
}

export interface IntegrityInsightsResult {
    generatedAt: Date;
    insights: GuardianInsight[];
    systemSignals: IntegritySystemSignals;
    why: string;
}

export type IntegrityInsightsRunResult = {
    status: 'ok';
    mode: 'deterministic' | 'hybrid';
    result: IntegrityInsightsResult;
};

const isActive = (commitment: Commitment): boolean =>
    commitment.status === CommitmentStatus.BACKLOG || commitment.status === CommitmentStatus.ACTIVE;

const DEFAULT_OWNER_SATURATION_EXCLUSION = ['Tavares'];

function getSaturationExcludedOwners(): string[] {
    const configured = String(process.env.FLOW_GUARDIAN_OWNER_SATURATION_EXCLUDE || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    const merged = [...DEFAULT_OWNER_SATURATION_EXCLUSION, ...configured];
    return Array.from(new Set(merged.map(owner => owner.toLowerCase())));
}

const startOfDay = (value: Date): Date => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const isOpenHighRisk = (commitment: Commitment): boolean =>
    (commitment.riscos || []).some(risk =>
        (risk.statusMitigacao === 'ABERTO' || risk.statusMitigacao === 'EM_MITIGACAO')
        && riskMatrixScore(risk) >= 6,
    );

const checklistProgress = (commitment: Commitment): number => {
    const checklist = commitment.checklist || [];
    if (checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
};

const daysUntilDue = (commitment: Commitment, today: Date): number => {
    const due = startOfDay(new Date(commitment.dataEsperada));
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const isChecklistStalledNearDue = (commitment: Commitment, today: Date): boolean => {
    const checklist = commitment.checklist || [];
    if (checklist.length === 0) return false;
    return checklistProgress(commitment) === 0 && daysUntilDue(commitment, today) <= 2;
};

const isChecklistInconsistent = (commitment: Commitment): boolean => {
    const checklist = commitment.checklist || [];
    if (checklist.length === 0) return false;
    return checklistProgress(commitment) === 100 && commitment.status !== CommitmentStatus.DONE;
};

function toSeverity(score: number): InsightSeverity {
    if (score >= 8) return 'HIGH';
    if (score >= 5) return 'MEDIUM';
    return 'LOW';
}

export function buildDeterministicIntegrityInsights(
    commitments: Commitment[],
    now: Date = new Date(),
): IntegrityInsightsResult {
    const today = startOfDay(now);
    const active = commitments.filter(isActive);

    const ownerMap = active.reduce((acc, commitment) => {
        const key = commitment.owner || 'Sem owner';
        if (!acc[key]) {
            acc[key] = {
                owner: key,
                activeCount: 0,
                overdueCount: 0,
                blockedCount: 0,
                highRiskOpenCount: 0,
                recurrentCount: 0,
                saturationScore: 0,
            };
        }
        const row = acc[key];
        row.activeCount += 1;
        if (startOfDay(new Date(commitment.dataEsperada)) < today) row.overdueCount += 1;
        if (commitment.hasImpedimento) row.blockedCount += 1;
        if (isOpenHighRisk(commitment)) row.highRiskOpenCount += 1;
        if ((commitment.renegociadoCount || 0) >= 2) row.recurrentCount += 1;
        if (isChecklistStalledNearDue(commitment, today)) row.highRiskOpenCount += 1;
        return acc;
    }, {} as Record<string, OwnerSaturationSignal>);

    const ownerSaturation = Object.values(ownerMap)
        .map(owner => {
            const saturationScore = (
                (owner.activeCount * 1)
                + (owner.overdueCount * 2)
                + (owner.blockedCount * 2)
                + (owner.highRiskOpenCount * 2)
                + (owner.recurrentCount * 1.5)
            );
            return {
                ...owner,
                saturationScore: Number(saturationScore.toFixed(1)),
            };
        })
        .sort((a, b) => b.saturationScore - a.saturationScore);

    const projectMap = active.reduce((acc, commitment) => {
        const key = commitment.projeto || 'Sem projeto';
        if (!acc[key]) {
            acc[key] = {
                projeto: key,
                activeCount: 0,
                unstableSignals: 0,
                highRiskOpenCount: 0,
            };
        }
        const row = acc[key];
        row.activeCount += 1;
        if (startOfDay(new Date(commitment.dataEsperada)) < today) row.unstableSignals += 1;
        if (commitment.hasImpedimento) row.unstableSignals += 1;
        if ((commitment.renegociadoCount || 0) >= 2) row.unstableSignals += 1;
        if (isOpenHighRisk(commitment)) {
            row.unstableSignals += 1;
            row.highRiskOpenCount += 1;
        }
        if (isChecklistStalledNearDue(commitment, today)) row.unstableSignals += 1;
        return acc;
    }, {} as Record<string, ProjectRiskSignal>);

    const projectRisk = Object.values(projectMap)
        .sort((a, b) => b.unstableSignals - a.unstableSignals);

    const totals = active.reduce((acc, commitment) => {
        if (startOfDay(new Date(commitment.dataEsperada)) < today) acc.overdue += 1;
        if (commitment.hasImpedimento) acc.blocked += 1;
        if (isOpenHighRisk(commitment)) acc.highRiskOpen += 1;
        if ((commitment.renegociadoCount || 0) >= 2) acc.recurrent += 1;
        if (isChecklistStalledNearDue(commitment, today)) acc.checklistStalledNearDue += 1;
        if (isChecklistInconsistent(commitment)) acc.checklistInconsistency += 1;
        return acc;
    }, {
        active: active.length,
        overdue: 0,
        blocked: 0,
        highRiskOpen: 0,
        recurrent: 0,
        checklistStalledNearDue: 0,
        checklistInconsistency: 0,
    });

    const insights: GuardianInsight[] = [];

    const excludedOwners = getSaturationExcludedOwners();
    const topOwner = ownerSaturation.find(owner => !excludedOwners.includes(owner.owner.toLowerCase()));
    if (topOwner && topOwner.saturationScore >= 5) {
        insights.push({
            id: `owner-saturation:${topOwner.owner}`,
            severity: toSeverity(topOwner.saturationScore),
            headline: `Saturação de owner: ${topOwner.owner}`,
            evidence: `${topOwner.activeCount} ativos, ${topOwner.overdueCount} vencidos, ${topOwner.blockedCount} bloqueados, ${topOwner.highRiskOpenCount} com risco alto aberto.`,
            recommendedAction: 'Rebalancear carga, revisar prioridades da semana e definir backup operacional.',
            why: 'Concentração de sinais críticos no mesmo owner aumenta risco de atraso sistêmico.',
        });
    }

    const unstableProject = projectRisk.find(project => project.activeCount >= 2 && project.unstableSignals >= 3);
    if (unstableProject) {
        insights.push({
            id: `project-instability:${unstableProject.projeto}`,
            severity: unstableProject.unstableSignals >= 5 ? 'HIGH' : 'MEDIUM',
            headline: `Projeto com instabilidade recorrente: ${unstableProject.projeto}`,
            evidence: `${unstableProject.activeCount} ativos e ${unstableProject.unstableSignals} sinais de instabilidade agregados.`,
            recommendedAction: 'Executar revisão de plano do projeto e congelar novos compromissos até estabilização.',
            why: 'Projeto com múltiplos sinais simultâneos tende a gerar efeito cascata entre entregas.',
        });
    }

    if (totals.recurrent >= 2) {
        insights.push({
            id: 'recurrent-renegotiation',
            severity: totals.recurrent >= 4 ? 'HIGH' : 'MEDIUM',
            headline: 'Padrão de reincidência em renegociações',
            evidence: `${totals.recurrent} compromisso(s) ativo(s) já foram renegociados 2+ vezes.`,
            recommendedAction: 'Revisar critérios de compromisso e capacidade antes de assumir novos prazos.',
            why: 'Renegociação reincidente indica baixa aderência entre planejamento e execução.',
        });
    }

    if (totals.blocked >= 3) {
        insights.push({
            id: 'blocked-pressure',
            severity: totals.blocked >= 5 ? 'HIGH' : 'MEDIUM',
            headline: 'Pressão de bloqueios no fluxo',
            evidence: `${totals.blocked} compromisso(s) ativo(s) estão bloqueados por dependências.`,
            recommendedAction: 'Atacar desbloqueios críticos primeiro e reduzir entrada de novos itens dependentes.',
            why: 'Acúmulo de bloqueios aumenta WIP improdutivo e reduz previsibilidade de entrega.',
        });
    }

    if (totals.checklistStalledNearDue >= 1) {
        insights.push({
            id: 'checklist-stalled-near-due',
            severity: totals.checklistStalledNearDue >= 2 ? 'HIGH' : 'MEDIUM',
            headline: 'Checklist sem progresso próximo ao prazo',
            evidence: `${totals.checklistStalledNearDue} compromisso(s) com checklist em 0% e vencimento em até 2 dias.`,
            recommendedAction: 'Quebrar desbloqueios imediatos e revisar escopo mínimo viável da entrega.',
            why: 'Checklist parado perto do prazo é sinal de risco de execução concentrado.',
        });
    }

    if (totals.checklistInconsistency >= 1) {
        insights.push({
            id: 'checklist-status-inconsistency',
            severity: 'LOW',
            headline: 'Inconsistência leve: checklist concluído com status aberto',
            evidence: `${totals.checklistInconsistency} compromisso(s) com checklist em 100% e status diferente de DONE.`,
            recommendedAction: 'Revisar status dos compromissos para refletir conclusão operacional.',
            why: 'Sinal de desalinhamento entre execução e status registrado no fluxo.',
        });
    }

    const sortedInsights = insights
        .sort((a, b) => {
            const rank: Record<InsightSeverity, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return rank[b.severity] - rank[a.severity];
        })
        .slice(0, 6);

    return {
        generatedAt: new Date(now),
        insights: sortedInsights,
        systemSignals: {
            totals,
            ownerSaturation: ownerSaturation.slice(0, 5),
            projectRisk: projectRisk.slice(0, 5),
        },
        why: 'Insights gerados por leitura determinística dos sinais de saturação, risco e recorrência.',
    };
}

export async function analyzeIntegrityInsights(
    commitments: Commitment[],
    now: Date = new Date(),
): Promise<IntegrityInsightsRunResult> {
    const deterministic = buildDeterministicIntegrityInsights(commitments, now);
    const enabled = process.env.NEXT_PUBLIC_FLOW_GUARDIAN_ENABLED === 'true';
    if (!enabled || !process.env.OPENAI_API_KEY) {
        return { status: 'ok', mode: 'deterministic', result: deterministic };
    }

    // v1: deterministic source of truth; AI narrative enrichment can be added without changing contracts.
    return { status: 'ok', mode: 'deterministic', result: deterministic };
}
