import { vi, describe, it, expect, beforeEach } from 'vitest';
import { saveCommitments, loadCommitments } from '@/services/PersistenceService';
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
            dataEsperada: new Date('2026-12-31'),
            status: CommitmentStatus.ACTIVE,
            hasImpedimento: false,
            criadoEm: new Date('2026-02-22'),
            tipo: 'DELIVERY',
            impacto: 'MEDIUM',
            riscos: '',
            renegociadoCount: 0,
            historico: []
        }
    ];

    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn(),
        });
    });

    it('should save commitments to localStorage', () => {
        saveCommitments(mockCommitments);
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'flow_integrity_commitments',
            expect.any(String)
        );
    });

    it('should load commitments from localStorage', () => {
        const serialized = JSON.stringify(mockCommitments);
        vi.mocked(localStorage.getItem).mockReturnValue(serialized);

        const loaded = loadCommitments();
        expect(loaded.length).toBe(1);
        expect(loaded[0].titulo).toBe('Test 1');
        expect(loaded[0].dataEsperada).toBeInstanceOf(Date);
    });

    it('should return empty array if no data in localStorage', () => {
        vi.mocked(localStorage.getItem).mockReturnValue(null);
        const loaded = loadCommitments();
        expect(loaded).toEqual([]);
    });
});
