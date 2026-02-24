import { Commitment, CommitmentRisk } from '../models/Commitment';

const LEGACY_STORAGE_KEY = 'flow_integrity_commitments';
const REFLECTION_FEED_STATE_BASE_KEY = 'flow_integrity_reflection_feed_state';

export type AppEnvironment = 'dev' | 'prod';

export function getAppEnvironment(): AppEnvironment {
    return process.env.NEXT_PUBLIC_APP_ENV === 'prod' ? 'prod' : 'dev';
}

export function getCommitmentsStorageKey(): string {
    return `${LEGACY_STORAGE_KEY}_${getAppEnvironment()}`;
}

export function getReflectionFeedStateKey(): string {
    return `${REFLECTION_FEED_STATE_BASE_KEY}_${getAppEnvironment()}`;
}

function normalizeRisks(riscos: unknown): CommitmentRisk[] {
    if (typeof riscos === 'string') {
        const text = riscos.trim();
        if (!text) return [];

        return [{
            id: `risk-migrated-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            descricao: text,
            categoria: 'OUTRO',
            statusMitigacao: 'ABERTO',
            probabilidade: 'MEDIUM',
            impacto: 'MEDIUM',
        }];
    }

    if (!Array.isArray(riscos)) return [];

    return riscos
        .map((risk): CommitmentRisk | null => {
            if (!risk || typeof risk !== 'object') return null;
            const descricao = String((risk as any).descricao ?? '').trim();
            if (!descricao) return null;

            return {
                id: String((risk as any).id || `risk-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
                descricao,
                categoria: (risk as any).categoria ?? 'OUTRO',
                statusMitigacao: (risk as any).statusMitigacao ?? 'ABERTO',
                probabilidade: (risk as any).probabilidade ?? 'MEDIUM',
                impacto: (risk as any).impacto ?? 'MEDIUM',
            };
        })
        .filter((risk): risk is CommitmentRisk => risk !== null);
}

export function saveCommitments(commitments: Commitment[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getCommitmentsStorageKey(), JSON.stringify(commitments));
}

function parseCommitments(raw: string): Commitment[] {
    const commitments = JSON.parse(raw) as any[];
    return commitments.map(c => ({
        ...c,
        dataEsperada: new Date(c.dataEsperada),
        criadoEm: new Date(c.criadoEm),
        dependencias: Array.isArray(c.dependencias) ? c.dependencias.map((d: unknown) => String(d)) : [],
        riscos: normalizeRisks(c.riscos),
        historico: (c.historico || []).map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp),
        })),
    }));
}

export function loadCommitments(): Commitment[] {
    if (typeof window === 'undefined') return [];

    const envKey = getCommitmentsStorageKey();
    const envData = localStorage.getItem(envKey);
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    const data = envData || legacyData;

    if (!data) return [];

    try {
        const parsed = parseCommitments(data);

        // Migra silenciosamente dados legados para a chave segmentada do ambiente atual.
        if (!envData && legacyData) {
            localStorage.setItem(envKey, legacyData);
        }

        return parsed;
    } catch (error) {
        console.error('Falha ao carregar compromissos do localStorage:', error);
        return [];
    }
}

export function clearCommitmentsStorage(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getCommitmentsStorageKey());
}

export function loadReflectionFeedState(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(getReflectionFeedStateKey());
    if (!data) return {};

    try {
        const parsed = JSON.parse(data) as Record<string, string>;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

export function saveReflectionFeedState(state: Record<string, string>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getReflectionFeedStateKey(), JSON.stringify(state));
}
