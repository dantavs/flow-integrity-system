import { Commitment } from '../models/Commitment';

const STORAGE_KEY = 'flow_integrity_commitments';

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
        // Re-converter strings de data para objetos Date
        return commitments.map(c => ({
            ...c,
            dataEsperada: new Date(c.dataEsperada),
            criadoEm: new Date(c.criadoEm)
        }));
    } catch (error) {
        console.error('Falha ao carregar compromissos do localStorage:', error);
        return [];
    }
}
