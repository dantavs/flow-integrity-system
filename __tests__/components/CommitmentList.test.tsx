import { render, screen, fireEvent } from '@testing-library/react';
import CommitmentList from '@/components/CommitmentList';
import { Commitment, CommitmentStatus } from '@/models/Commitment';
import { describe, it, expect, vi } from 'vitest';

describe('CommitmentList', () => {
    const mockCommitments: Commitment[] = [
        {
            id: '1',
            titulo: 'Compromisso 1',
            descricao: '',
            projeto: 'Projeto A',
            area: 'Engenharia',
            owner: 'Daniel',
            stakeholder: 'Maria',
            dependencias: [],
            dataEsperada: new Date('2026-12-31'),
            status: CommitmentStatus.ACTIVE,
            hasImpedimento: false,
            criadoEm: new Date(),
            tipo: 'DELIVERY',
            impacto: 'MEDIUM',
            checklist: [],
            riscos: [],
            renegociadoCount: 0,
            historico: []
        },
        {
            id: '2',
            titulo: 'Compromisso 2',
            descricao: '',
            projeto: 'Projeto B',
            area: 'QA',
            owner: 'Daniel',
            stakeholder: 'João',
            dependencias: ['1'],
            dataEsperada: new Date('2026-11-30'),
            status: CommitmentStatus.BACKLOG,
            hasImpedimento: true,
            criadoEm: new Date(),
            tipo: 'ALIGNMENT',
            impacto: 'HIGH',
            checklist: [],
            riscos: [{
                id: 'r2',
                descricao: 'Falta de acesso',
                categoria: 'DEPENDENCIA',
                statusMitigacao: 'ABERTO',
                probabilidade: 'HIGH',
                impacto: 'MEDIUM',
            }],
            renegociadoCount: 0,
            historico: []
        }
    ];

    it('should render the empty state when no commitments are provided', () => {
        render(<CommitmentList commitments={[]} />);
        expect(screen.getByText(/Nenhum fluxo de integridade monitorado/i)).toBeDefined();
    });

    it('should render a list of commitment cards', () => {
        render(<CommitmentList commitments={mockCommitments} />);

        expect(screen.getByText('Compromisso 1')).toBeDefined();
        expect(screen.getByText('Compromisso 2')).toBeDefined();
        expect(screen.getByText(/Projeto A/)).toBeDefined();
        expect(screen.getByText(/Projeto B/)).toBeDefined();
    });

    it('should call onStatusChange when a status is updated', () => {
        const handleStatusChange = vi.fn();
        render(<CommitmentList commitments={mockCommitments} onStatusChange={handleStatusChange} />);

        const statusSelects = screen.getAllByRole('combobox');
        fireEvent.change(statusSelects[0], { target: { value: CommitmentStatus.DONE } });

        expect(handleStatusChange).toHaveBeenCalledWith('1', CommitmentStatus.DONE);
    });
});
