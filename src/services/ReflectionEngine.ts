import { Commitment, CommitmentStatus, riskMatrixScore } from '../models/Commitment';
import {
    REFLECTION_FEED_THRESHOLDS,
    ReflectionItem,
    ReflectionSeverity,
} from './ReflectionContract';

interface BuildReflectionFeedOptions {
    cooldownByDedupKey?: Record<string, string | Date>;
    maxItems?: number;
}

interface ReflectionFeedSummary {
    generatedAt: Date;
    items: ReflectionItem[];
}

const isActive = (commitment: Commitment): boolean =>
    commitment.status === CommitmentStatus.BACKLOG || commitment.status === CommitmentStatus.ACTIVE;

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

const isOpenRisk = (status: string): boolean => status === 'ABERTO' || status === 'EM_MITIGACAO';

const doneTimestamp = (commitment: Commitment): Date | null => {
    const doneEvent = (commitment.historico || [])
        .filter(event => event.tipo === 'STATUS_CHANGE' && event.valorNovo === CommitmentStatus.DONE)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    return doneEvent ? new Date(doneEvent.timestamp) : null;
};

const isUnstableSignal = (commitment: Commitment, today: Date): boolean => {
    const due = startOfDay(new Date(commitment.dataEsperada));
    const hasHighOpenRisk = (commitment.riscos || []).some(risk => isOpenRisk(risk.statusMitigacao) && riskMatrixScore(risk) >= 6);
    return due < today || commitment.hasImpedimento || hasHighOpenRisk || (commitment.renegociadoCount || 0) >= 2;
};

function scoreToSeverity(score: number): ReflectionSeverity {
    if (score >= 90) return 'HIGH';
    if (score >= 70) return 'MEDIUM';
    return 'LOW';
}

function byPriority(a: ReflectionItem, b: ReflectionItem): number {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function buildReflectionFeed(
    commitments: Commitment[],
    now: Date = new Date(),
    options: BuildReflectionFeedOptions = {},
): ReflectionFeedSummary {
    const today = startOfDay(now);
    const dependencyDoneStart = addDays(today, -REFLECTION_FEED_THRESHOLDS.dependencyDoneWindowDays);
    const newCommitmentStart = addDays(today, -REFLECTION_FEED_THRESHOLDS.newCommitmentWindowDays);
    const active = commitments.filter(isActive);
    const byId = new Map(commitments.map(commitment => [commitment.id, commitment]));
    const cooldownMap = options.cooldownByDedupKey || {};
    const maxItems = options.maxItems ?? REFLECTION_FEED_THRESHOLDS.maxFeedItems;

    const projectSignals = active.reduce((acc, commitment) => {
        if (!acc[commitment.projeto]) acc[commitment.projeto] = 0;
        if (isUnstableSignal(commitment, today)) acc[commitment.projeto] += 1;
        return acc;
    }, {} as Record<string, number>);
    const newCommitmentsByProject: Record<string, Commitment[]> = {};

    const reflections: ReflectionItem[] = [];

    active.forEach(commitment => {
        const completedDeps = (commitment.dependencias || [])
            .map(depId => byId.get(depId))
            .filter((dep): dep is Commitment => Boolean(dep && dep.status === CommitmentStatus.DONE))
            .filter(dep => {
                const doneAt = doneTimestamp(dep);
                if (!doneAt) return false;
                const day = startOfDay(doneAt);
                return day >= dependencyDoneStart && day <= today;
            });

        if (completedDeps.length > 0) {
            const dedupKey = `DEPENDENCY_COMPLETED:${commitment.id}`;
            const score = 78;
            reflections.push({
                id: dedupKey,
                dedupKey,
                triggerType: 'DEPENDENCY_COMPLETED',
                severity: scoreToSeverity(score),
                score,
                message: `DependÃªncia concluÃ­da: revisar prÃ³ximo passo de "${commitment.titulo}".`,
                context: `${completedDeps.length} dependÃªncia(s) concluÃ­da(s) nos Ãºltimos ${REFLECTION_FEED_THRESHOLDS.dependencyDoneWindowDays} dias.`,
                why: 'Compromisso ativo depende de item que mudou para DONE recentemente.',
                relatedCommitmentIds: [commitment.id, ...completedDeps.map(dep => dep.id)],
                relatedProject: commitment.projeto,
                actions: [
                    { type: 'OPEN_COMMITMENT', label: 'Revisar compromisso', commitmentId: commitment.id },
                    { type: 'FILTER_PROJECT', label: 'Ver projeto', projeto: commitment.projeto },
                ],
                createdAt: new Date(now),
            });
        }

        if ((commitment.renegociadoCount || 0) >= REFLECTION_FEED_THRESHOLDS.postponementMinRenegotiations) {
            const dedupKey = `POSTPONEMENT_PATTERN:${commitment.id}`;
            const score = (commitment.renegociadoCount || 0) >= 4 ? 92 : 82;
            reflections.push({
                id: dedupKey,
                dedupKey,
                triggerType: 'POSTPONEMENT_PATTERN',
                severity: scoreToSeverity(score),
                score,
                message: `PadrÃ£o de adiamento em "${commitment.titulo}".`,
                context: `${commitment.renegociadoCount || 0} renegociaÃ§Ã£o(Ãµes) registrada(s).`,
                why: 'Quantidade de renegociaÃ§Ãµes acima do limite definido para reincidÃªncia.',
                relatedCommitmentIds: [commitment.id],
                relatedProject: commitment.projeto,
                actions: [
                    { type: 'OPEN_COMMITMENT', label: 'Reavaliar compromisso', commitmentId: commitment.id },
                    { type: 'FILTER_PROJECT', label: 'Ver projeto', projeto: commitment.projeto },
                ],
                createdAt: new Date(now),
            });
        }

        const createdAt = startOfDay(new Date(commitment.criadoEm));
        const isNewCommitment = createdAt >= newCommitmentStart && createdAt <= today;
        const projectIsUnstable = (projectSignals[commitment.projeto] || 0) >= REFLECTION_FEED_THRESHOLDS.unstableProjectSignalMin;
        if (isNewCommitment && projectIsUnstable) {
            if (!newCommitmentsByProject[commitment.projeto]) newCommitmentsByProject[commitment.projeto] = [];
            newCommitmentsByProject[commitment.projeto].push(commitment);
        }
    });

    Object.entries(newCommitmentsByProject).forEach(([projeto, newCommitments]) => {
        if (newCommitments.length === 0) return;

        const latestCommitment = newCommitments
            .slice()
            .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())[0];
        const dedupKey = `NEW_COMMITMENT_ON_UNSTABLE_PROJECT:${projeto}`;
        const score = 96;

        reflections.push({
            id: dedupKey,
            dedupKey,
            triggerType: 'NEW_COMMITMENT_ON_UNSTABLE_PROJECT',
            severity: scoreToSeverity(score),
            score,
            message: 'Novo compromisso em projeto instável: validar capacidade real.',
            context: `Projeto "${projeto}" possui ${projectSignals[projeto]} sinais ativos de instabilidade e ${newCommitments.length} novo(s) compromisso(s) recente(s).`,
            why: 'Compromissos recentes foram criados em projeto com múltiplos sinais de risco operacional.',
            relatedCommitmentIds: newCommitments.map(commitment => commitment.id),
            relatedProject: projeto,
            actions: [
                { type: 'OPEN_COMMITMENT', label: 'Revisar compromisso', commitmentId: latestCommitment.id },
                { type: 'FILTER_PROJECT', label: 'Ver projeto', projeto },
            ],
            createdAt: new Date(now),
        });
    });

    const activeByProject = active.reduce((acc, commitment) => {
        if (!acc[commitment.projeto]) acc[commitment.projeto] = [];
        acc[commitment.projeto].push(commitment);
        return acc;
    }, {} as Record<string, Commitment[]>);

    Object.entries(activeByProject).forEach(([projeto, projectCommitments]) => {
        const openRiskCount = projectCommitments.reduce((count, commitment) =>
            count + (commitment.riscos || []).filter(risk => isOpenRisk(risk.statusMitigacao)).length, 0);

        if (openRiskCount >= REFLECTION_FEED_THRESHOLDS.projectOpenRiskMin) {
            const hasHigh = projectCommitments.some(commitment =>
                (commitment.riscos || []).some(risk => isOpenRisk(risk.statusMitigacao) && riskMatrixScore(risk) >= 6),
            );
            const dedupKey = `PROJECT_RISK_CLUSTER:${projeto}`;
            const score = hasHigh ? 91 : 76;
            reflections.push({
                id: dedupKey,
                dedupKey,
                triggerType: 'PROJECT_RISK_CLUSTER',
                severity: scoreToSeverity(score),
                score,
                message: `Projeto "${projeto}" concentra riscos abertos.`,
                context: `${openRiskCount} risco(s) aberto(s) distribuÃ­do(s) em ${projectCommitments.length} compromisso(s) ativo(s).`,
                why: 'Volume de risco aberto por projeto acima do threshold definido.',
                relatedCommitmentIds: projectCommitments.map(commitment => commitment.id),
                relatedProject: projeto,
                actions: [
                    { type: 'FILTER_PROJECT', label: 'Focar no projeto', projeto },
                ],
                createdAt: new Date(now),
            });
        }
    });

    const deduped = Array.from(
        reflections
            .reduce((acc, reflection) => {
                const current = acc.get(reflection.dedupKey);
                if (!current || byPriority(reflection, current) < 0) {
                    acc.set(reflection.dedupKey, reflection);
                }
                return acc;
            }, new Map<string, ReflectionItem>())
            .values(),
    );

    const cooldownMs = REFLECTION_FEED_THRESHOLDS.cooldownHours * 60 * 60 * 1000;
    const withoutCooldown = deduped.filter(reflection => {
        const lastShown = cooldownMap[reflection.dedupKey];
        if (!lastShown) return true;
        const shownAt = new Date(lastShown).getTime();
        if (Number.isNaN(shownAt)) return true;
        return new Date(now).getTime() - shownAt >= cooldownMs;
    });

    const ranked = withoutCooldown.sort(byPriority).slice(0, maxItems);

    return {
        generatedAt: new Date(now),
        items: ranked,
    };
}

