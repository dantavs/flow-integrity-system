import { render, screen, fireEvent } from '@testing-library/react';
import CommitmentForm from '@/components/CommitmentForm';
import { vi } from 'vitest';

describe('CommitmentForm', () => {
    it('should render all form fields', () => {
        render(<CommitmentForm onSubmit={vi.fn()} />);

        expect(screen.getByLabelText(/Título do Compromisso/i)).toBeDefined();
        expect(screen.getByLabelText(/Projeto de Referência/i)).toBeDefined();
        expect(screen.getByLabelText(/Área Responsável/i)).toBeDefined();
        expect(screen.getByLabelText(/Owner \(Quem entrega\)/i)).toBeDefined();
        expect(screen.getByLabelText(/Stakeholder \(Quem recebe\)/i)).toBeDefined();
        expect(screen.getByLabelText(/Data de Entrega/i)).toBeDefined();
        expect(screen.getByLabelText(/Tipo de Fluxo/i)).toBeDefined();
        expect(screen.getByLabelText(/Impacto Sistêmico/i)).toBeDefined();
        expect(screen.getByLabelText(/Riscos e Considerações/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Garantir Compromisso/i })).toBeDefined();
    });

    it('should call onSubmit with form data when submitted', async () => {
        const handleSubmit = vi.fn();
        render(<CommitmentForm onSubmit={handleSubmit} />);

        fireEvent.change(screen.getByLabelText(/Título do Compromisso/i), { target: { value: 'Novo Compromisso' } });
        fireEvent.change(screen.getByLabelText(/Projeto de Referência/i), { target: { value: 'Projeto Alpha' } });
        fireEvent.change(screen.getByLabelText(/Área Responsável/i), { target: { value: 'Engenharia' } });
        fireEvent.change(screen.getByLabelText(/Owner \(Quem entrega\)/i), { target: { value: 'Daniel' } });
        fireEvent.change(screen.getByLabelText(/Stakeholder \(Quem recebe\)/i), { target: { value: 'Gerência' } });
        fireEvent.change(screen.getByLabelText(/Data de Entrega/i), { target: { value: '2026-12-31' } });
        fireEvent.change(screen.getByLabelText(/Tipo de Fluxo/i), { target: { value: 'DELIVERY' } });
        fireEvent.change(screen.getByLabelText(/Impacto Sistêmico/i), { target: { value: 'HIGH' } });
        fireEvent.change(screen.getByLabelText(/Riscos e Considerações/i), { target: { value: 'Nenhum' } });

        fireEvent.click(screen.getByRole('button', { name: /Garantir Compromisso/i }));

        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
            titulo: 'Novo Compromisso',
            projeto: 'Projeto Alpha',
            area: 'Engenharia',
            owner: 'Daniel',
            stakeholder: 'Gerência',
            tipo: 'DELIVERY',
            impacto: 'HIGH',
            riscos: 'Nenhum'
        }));
    });
});
