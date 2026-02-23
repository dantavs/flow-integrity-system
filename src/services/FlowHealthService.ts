import { Commitment, CommitmentStatus, riskMatrixScore } from '../models/Commitment';

export interface FlowHealthBreakdown {
    overdue: number;
    blockedByDependency: number;
    highRisk: number;
    openRisk: number;
    recurrent: number;
}

export interface FlowHealthSummary {
    score: number;
    level: 'HEALTHY' | 'ATTENTION' | 'CRITICAL';
    totalActive: number;
    breakdown: FlowHealthBreakdown;
}

const MAX_SCORE = 100;

const isRiskOpen = (status: string) => status === 'ABERTO' || status === 'EM_MITIGACAO';

export function calculateFlowHealth(commitments: Commitment[]): FlowHealthSummary {
    const active = commitments.filter(
        c => c.status === CommitmentStatus.BACKLOG || c.status === CommitmentStatus.ACTIVE,
    );

    if (active.length === 0) {
        return {
            score: 100,
            level: 'HEALTHY',
            totalActive: 0,
            breakdown: {
                overdue: 0,
                blockedByDependency: 0,
                highRisk: 0,
                openRisk: 0,
                recurrent: 0,
            },
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const breakdown: FlowHealthBreakdown = {
        overdue: 0,
        blockedByDependency: 0,
        highRisk: 0,
        openRisk: 0,
        recurrent: 0,
    };

    const perCommitmentScores = active.map(commitment => {
        let score = MAX_SCORE;

        const expected = new Date(commitment.dataEsperada);
        expected.setHours(0, 0, 0, 0);

        if (expected < today) {
            breakdown.overdue += 1;
            score -= 35;
        }

        if (commitment.hasImpedimento) {
            breakdown.blockedByDependency += 1;
            score -= 25;
        }

        const openRisks = commitment.riscos.filter(risk => isRiskOpen(risk.statusMitigacao));
        if (openRisks.length > 0) {
            breakdown.openRisk += 1;
            score -= 10;
        }

        const hasHighRisk = openRisks.some(risk => riskMatrixScore(risk) >= 6);
        if (hasHighRisk) {
            breakdown.highRisk += 1;
            score -= 20;
        }

        if ((commitment.renegociadoCount || 0) >= 2) {
            breakdown.recurrent += 1;
            score -= 10;
        }

        return Math.max(0, score);
    });

    const avg = perCommitmentScores.reduce((sum, value) => sum + value, 0) / perCommitmentScores.length;
    const rounded = Math.round(avg);

    const level: FlowHealthSummary['level'] = rounded >= 80 ? 'HEALTHY' : rounded >= 60 ? 'ATTENTION' : 'CRITICAL';

    return {
        score: rounded,
        level,
        totalActive: active.length,
        breakdown,
    };
}
