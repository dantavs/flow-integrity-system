import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
    saveCommitments,
    loadCommitments,
    clearCommitmentsStorage,
    getAppEnvironment,
    getCommitmentsStorageKey,
} from '@/services/PersistenceService';
import { Commitment, CommitmentStatus } from '@/models/Commitment';

describe('PersistenceService', () => {
    const mockCommitments: Commitment[] = [
        {
            id: '1',
            titulo: 'Test 1',
            projeto: 'Proj 1',
            area: 'Area 1',
            owner: 'Owner 1',
            stakeholder: 'Stk 1',
            dependencias: [],
            dataEsperada: new Date('2026-12-31'),
            status: CommitmentStatus.ACTIVE,
            hasImpedimento: false,
            criadoEm: new Date('2026-02-22'),
            tipo: 'DELIVERY',
            impacto: 'MEDIUM',
            riscos: [{
                id: 'r1',
                descricao: 'Dependência externa',
                categoria: 'DEPENDENCIA',
                statusMitigacao: 'ABERTO',
                probabilidade: 'MEDIUM',
                impacto: 'HIGH',
            }],
            renegociadoCount: 0,
            historico: []
        }
    ];

    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        });
    });

    it('should expose dev as default environment', () => {
        expect(getAppEnvironment()).toBe('dev');
        expect(getCommitmentsStorageKey()).toBe('flow_integrity_commitments_dev');
    });

    it('should save commitments to environment storage key', () => {
        saveCommitments(mockCommitments);
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'flow_integrity_commitments_dev',
            expect.any(String)
        );
    });

    it('should load commitments from environment storage key', () => {
        const serialized = JSON.stringify(mockCommitments);
        vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
            if (key === 'flow_integrity_commitments_dev') return serialized;
            return null;
        });

        const loaded = loadCommitments();
        expect(loaded.length).toBe(1);
        expect(loaded[0].titulo).toBe('Test 1');
        expect(loaded[0].dataEsperada).toBeInstanceOf(Date);
        expect(loaded[0].riscos).toHaveLength(1);
    });

    it('should fallback to legacy key and migrate data', () => {
        const serialized = JSON.stringify(mockCommitments);
        vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
            if (key === 'flow_integrity_commitments_dev') return null;
            if (key === 'flow_integrity_commitments') return serialized;
            return null;
        });

        const loaded = loadCommitments();

        expect(loaded.length).toBe(1);
        expect(localStorage.setItem).toHaveBeenCalledWith('flow_integrity_commitments_dev', serialized);
    });

    it('should migrate legacy textual risk from localStorage', () => {
        const legacy = [{
            ...mockCommitments[0],
            riscos: 'Risco legado em texto',
        }];
        vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
            if (key === 'flow_integrity_commitments_dev') return JSON.stringify(legacy);
            return null;
        });

        const loaded = loadCommitments();
        expect(loaded[0].riscos).toHaveLength(1);
        expect(loaded[0].riscos[0].descricao).toBe('Risco legado em texto');
    });

    it('should clear commitments from environment storage key', () => {
        clearCommitmentsStorage();
        expect(localStorage.removeItem).toHaveBeenCalledWith('flow_integrity_commitments_dev');
    });

    it('should return empty array if no data in localStorage', () => {
        vi.mocked(localStorage.getItem).mockReturnValue(null);
        const loaded = loadCommitments();
        expect(loaded).toEqual([]);
    });
});
