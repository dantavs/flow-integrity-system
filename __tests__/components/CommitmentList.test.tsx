import { render, screen, fireEvent } from '@testing-library/react';
import CommitmentList from '@/components/CommitmentList';
import { Commitment, CommitmentStatus } from '@/models/Commitment';
import { describe, it, expect, vi } from 'vitest';

describe('CommitmentList', () => {
    const mockCommitments: Commitment[] = [
        {
            id: '1',
            titulo: 'Compromisso 1',
            projeto: 'Projeto A',
            area: 'Engenharia',
            owner: 'Daniel',
            stakeholder: 'Maria',
            dataEsperada: new Date('2026-12-31'),
            status: CommitmentStatus.ACTIVE,
            hasImpedimento: false,
            criadoEm: new Date(),
            tipo: 'DELIVERY',
            impacto: 'MEDIUM',
            riscos: '',
            renegociadoCount: 0,
            historico: []
        },
        {
            id: '2',
            titulo: 'Compromisso 2',
            projeto: 'Projeto B',
            area: 'QA',
            owner: 'Daniel',
            stakeholder: 'João',
            dataEsperada: new Date('2026-11-30'),
            status: CommitmentStatus.BACKLOG,
            hasImpedimento: true,
            criadoEm: new Date(),
            tipo: 'ALIGNMENT',
            impacto: 'HIGH',
            riscos: 'Falta de acesso',
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
        expect(screen.getByText('Projeto A • Engenharia')).toBeDefined();
        expect(screen.getByText('Projeto B • QA')).toBeDefined();
    });

    it('should call onStatusChange when a status is updated', () => {
        const handleStatusChange = vi.fn();
        render(<CommitmentList commitments={mockCommitments} onStatusChange={handleStatusChange} />);

        // Simular mudança no select
        const statusSelects = screen.getAllByRole('combobox');
        fireEvent.change(statusSelects[0], { target: { value: CommitmentStatus.DONE } });

        expect(handleStatusChange).toHaveBeenCalledWith('1', CommitmentStatus.DONE);
    });
});
