import { describe, expect, it } from 'vitest';
import { addChecklistItem, getChecklistProgress, removeChecklistItem, toggleChecklistItem } from '@/services/CommitmentService';
import { CommitmentStatus } from '@/models/Commitment';

describe('Checklist domain', () => {
    const make = (overrides: any = {}) => ({
        id: '1',
        titulo: 'Compromisso',
        descricao: '',
        projeto: 'Projeto A',
        area: 'Area',
        owner: 'Owner',
        stakeholder: 'Stk',
        dependencias: [],
        dataEsperada: new Date('2026-03-01T00:00:00'),
        tipo: 'DELIVERY',
        impacto: 'MEDIUM',
        status: CommitmentStatus.ACTIVE,
        hasImpedimento: false,
        riscos: [],
        checklist: [],
        renegociadoCount: 0,
        criadoEm: new Date('2026-02-20T00:00:00'),
        historico: [],
        ...overrides,
    });

    it('adds checklist item and emits add event', () => {
        const commitment = addChecklistItem(make() as any, 'Item A');
        expect(commitment.checklist).toHaveLength(1);
        expect(commitment.checklist?.[0].text).toBe('Item A');
        expect(commitment.historico.at(-1)?.tipo).toBe('checklist_item_added');
    });

    it('toggles checklist item and emits completed event', () => {
        const base = make({
            checklist: [{ id: 'chk-1', text: 'A', completed: false, createdAt: new Date().toISOString() }],
        });
        const commitment = toggleChecklistItem(base as any, 'chk-1');
        expect(commitment.checklist?.[0].completed).toBe(true);
        expect(commitment.historico.at(-1)?.tipo).toBe('checklist_item_completed');
    });

    it('removes checklist item and emits removed event', () => {
        const base = make({
            checklist: [{ id: 'chk-2', text: 'A', completed: false, createdAt: new Date().toISOString() }],
        });
        const commitment = removeChecklistItem(base as any, 'chk-2');
        expect(commitment.checklist).toHaveLength(0);
        expect(commitment.historico.at(-1)?.tipo).toBe('checklist_item_removed');
    });

    it('calculates checklist progress', () => {
        const base = make({
            checklist: [
                { id: '1', text: 'A', completed: true, createdAt: new Date().toISOString() },
                { id: '2', text: 'B', completed: false, createdAt: new Date().toISOString() },
                { id: '3', text: 'C', completed: true, createdAt: new Date().toISOString() },
            ],
        });
        const progress = getChecklistProgress(base as any);
        expect(progress.total).toBe(3);
        expect(progress.completed).toBe(2);
        expect(progress.percent).toBe(67);
    });
});
