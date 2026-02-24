import { Commitment, CommitmentStatus, riskMatrixScore } from '../models/Commitment';
import { WeeklyBriefBlockKey, WEEKLY_BRIEF_BLOCKS, WEEKLY_BRIEF_THRESHOLDS } from './WeeklyBriefContract';

interface WeeklyBriefBlockResult {
    key: WeeklyBriefBlockKey;
    label: string;
    total: number;
    ids: string[];
}

export interface WeeklyBriefSummary {
    generatedAt: Date;
    blocks: Record<WeeklyBriefBlockKey, WeeklyBriefBlockResult>;
}

const isActive = (commitment: Commitment): boolean =>
    commitment.status === CommitmentStatus.BACKLOG || commitment.status === CommitmentStatus.ACTIVE;

const isArchived = (commitment: Commitment): boolean =>
    commitment.status === CommitmentStatus.DONE || commitment.status === CommitmentStatus.CANCELLED;

const isRiskOpen = (status: string): boolean => status === 'ABERTO' || status === 'EM_MITIGACAO';

const startOfDay = (value: Date): Date => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const addDays = (value: Date, days: number): Date => {
    const date = new Date(value);
    date.setDate(date.getDate() + days);
    return date;
};

const findDoneTimestamp = (commitment: Commitment): Date | null => {
    const history = commitment.historico || [];
    const doneEvents = history.filter(
        event =>
            event.tipo === 'STATUS_CHANGE'
            && event.valorNovo === CommitmentStatus.DONE,
    );

    if (doneEvents.length === 0) return null;

    const latest = doneEvents.reduce((current, candidate) =>
        new Date(candidate.timestamp).getTime() > new Date(current.timestamp).getTime() ? candidate : current,
    );

    return new Date(latest.timestamp);
};

export function buildWeeklyBrief(commitments: Commitment[], now: Date = new Date()): WeeklyBriefSummary {
    const today = startOfDay(now);
    const nextWeekStart = addDays(today, WEEKLY_BRIEF_THRESHOLDS.nextWeekStartOffsetDays);
    const nextWeekEnd = addDays(today, WEEKLY_BRIEF_THRESHOLDS.nextWeekEndOffsetDays);
    const recentCompletedStart = addDays(today, -WEEKLY_BRIEF_THRESHOLDS.recentCompletedWindowDays);

    const active = commitments.filter(isActive);
    const archived = commitments.filter(isArchived);

    const nextWeekIds = active
        .filter(commitment => {
            const expected = startOfDay(new Date(commitment.dataEsperada));
            return expected >= nextWeekStart && expected <= nextWeekEnd;
        })
        .map(commitment => commitment.id);

    const blockedIds = active
        .filter(commitment => commitment.hasImpedimento)
        .map(commitment => commitment.id);

    const recurrentIds = active
        .filter(commitment => (commitment.renegociadoCount || 0) >= WEEKLY_BRIEF_THRESHOLDS.recurrentRenegotiationMin)
        .map(commitment => commitment.id);

    const atRiskIds = active
        .filter(commitment => {
            const expected = startOfDay(new Date(commitment.dataEsperada));
            const isOverdue = expected < today;
            const isBlocked = commitment.hasImpedimento;
            const hasHighRiskOpen = (commitment.riscos || []).some(risk =>
                isRiskOpen(risk.statusMitigacao)
                && riskMatrixScore(risk) >= WEEKLY_BRIEF_THRESHOLDS.highRiskMatrixScoreMin,
            );
            const isRecurrent = (commitment.renegociadoCount || 0) >= WEEKLY_BRIEF_THRESHOLDS.recurrentRenegotiationMin;
            return isOverdue || isBlocked || hasHighRiskOpen || isRecurrent;
        })
        .map(commitment => commitment.id);

    const recentCompletedIds = archived
        .filter(commitment => commitment.status === CommitmentStatus.DONE)
        .filter(commitment => {
            const doneAt = findDoneTimestamp(commitment);
            if (!doneAt) return false;
            const doneDay = startOfDay(doneAt);
            return doneDay >= recentCompletedStart && doneDay <= today;
        })
        .map(commitment => commitment.id);

    const idsByBlock: Record<WeeklyBriefBlockKey, string[]> = {
        NEXT_WEEK_DELIVERIES: nextWeekIds,
        AT_RISK: atRiskIds,
        BLOCKED: blockedIds,
        RECURRENT: recurrentIds,
        RECENT_COMPLETED: recentCompletedIds,
    };

    const blocks = WEEKLY_BRIEF_BLOCKS.reduce((acc, block) => {
        const ids = idsByBlock[block.key];
        acc[block.key] = {
            key: block.key,
            label: block.label,
            total: ids.length,
            ids,
        };
        return acc;
    }, {} as Record<WeeklyBriefBlockKey, WeeklyBriefBlockResult>);

    return {
        generatedAt: new Date(now),
        blocks,
    };
}
