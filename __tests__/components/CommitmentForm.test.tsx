import { render, screen, fireEvent } from '@testing-library/react';
import CommitmentForm from '@/components/CommitmentForm';
import { vi } from 'vitest';

describe('CommitmentForm', () => {
    it('should render all form fields', () => {
        render(<CommitmentForm onSubmit={vi.fn()} />);

        expect(screen.getByLabelText(/Título/i)).toBeDefined();
        expect(screen.getByLabelText(/Projeto/i)).toBeDefined();
        expect(screen.getByLabelText(/Área/i)).toBeDefined();
        expect(screen.getByLabelText(/Owner/i)).toBeDefined();
        expect(screen.getByLabelText(/Stakeholder/i)).toBeDefined();
        expect(screen.getByLabelText(/Data Esperada/i)).toBeDefined();
        expect(screen.getByLabelText(/Tipo/i)).toBeDefined();
        expect(screen.getByLabelText(/Impacto/i)).toBeDefined();
        expect(screen.getByLabelText(/Riscos/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Criar Compromisso/i })).toBeDefined();
    });

    it('should call onSubmit with form data when submitted', async () => {
        const handleSubmit = vi.fn();
        render(<CommitmentForm onSubmit={handleSubmit} />);

        fireEvent.change(screen.getByLabelText(/Título/i), { target: { value: 'Novo Compromisso' } });
        fireEvent.change(screen.getByLabelText(/Projeto/i), { target: { value: 'Projeto Alpha' } });
        fireEvent.change(screen.getByLabelText(/Área/i), { target: { value: 'Engenharia' } });
        fireEvent.change(screen.getByLabelText(/Owner/i), { target: { value: 'Daniel' } });
        fireEvent.change(screen.getByLabelText(/Stakeholder/i), { target: { value: 'Gerência' } });
        fireEvent.change(screen.getByLabelText(/Data Esperada/i), { target: { value: '2026-12-31' } });
        fireEvent.change(screen.getByLabelText(/Tipo/i), { target: { value: 'DELIVERY' } });
        fireEvent.change(screen.getByLabelText(/Impacto/i), { target: { value: 'HIGH' } });
        fireEvent.change(screen.getByLabelText(/Riscos/i), { target: { value: 'Nenhum' } });

        fireEvent.click(screen.getByRole('button', { name: /Criar Compromisso/i }));

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
