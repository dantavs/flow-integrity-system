import { render, screen } from '@testing-library/react';
import CommitmentList from '@/components/CommitmentList';
import { Commitment, CommitmentStatus } from '@/models/Commitment';
import { describe, it, expect } from 'vitest';

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
            renegociadoCount: 0
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
            renegociadoCount: 0
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

    it('should display the correct status badge', () => {
        render(<CommitmentList commitments={mockCommitments} />);

        expect(screen.getByText('ACTIVE')).toBeDefined();
        expect(screen.getByText('BACKLOG')).toBeDefined();
    });
});
