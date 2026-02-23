import { Commitment, CommitmentRisk } from '../models/Commitment';

const STORAGE_KEY = 'flow_integrity_commitments';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(commitments));
}

export function loadCommitments(): Commitment[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
        const commitments = JSON.parse(data) as any[];
        return commitments.map(c => ({
            ...c,
            dataEsperada: new Date(c.dataEsperada),
            criadoEm: new Date(c.criadoEm),
            riscos: normalizeRisks(c.riscos),
            historico: (c.historico || []).map((h: any) => ({
                ...h,
                timestamp: new Date(h.timestamp),
            })),
        }));
    } catch (error) {
        console.error('Falha ao carregar compromissos do localStorage:', error);
        return [];
    }
}
