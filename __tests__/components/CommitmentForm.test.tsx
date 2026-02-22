import { render, screen, fireEvent } from '@testing-library/react';
import CommitmentForm from '@/components/CommitmentForm';
import { vi } from 'vitest';

describe('CommitmentForm', () => {
    it('should render all form fields', () => {
        render(<CommitmentForm onSubmit={vi.fn()} />);

        expect(screen.getByLabelText(/Título do Compromisso/i)).toBeDefined();
        expect(screen.getByLabelText(/Projeto/i)).toBeDefined();
        expect(screen.getByLabelText(/Área Responsável/i)).toBeDefined();
        expect(screen.getByLabelText(/Owner \(Quem entrega\)/i)).toBeDefined();
        expect(screen.getByLabelText(/Stakeholder \(Quem recebe\)/i)).toBeDefined();
        expect(screen.getByLabelText(/Data de Entrega/i)).toBeDefined();
        expect(screen.getByLabelText(/Tipo de Fluxo/i)).toBeDefined();
        expect(screen.getByLabelText(/Impacto Sistêmico/i)).toBeDefined();
        expect(screen.getByLabelText(/Riscos e Considerações/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Garantir Compromisso/i })).toBeDefined();
    });

    it('should call onSubmit with form data and reset form when submitted successfully', async () => {
        const handleSubmit = vi.fn().mockReturnValue(true);
        render(<CommitmentForm onSubmit={handleSubmit} />);

        fireEvent.change(screen.getByLabelText(/Título do Compromisso/i), { target: { value: 'Novo Compromisso' } });
        fireEvent.change(screen.getByLabelText(/Projeto/i), { target: { value: 'Projeto Alpha' } });
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
        }));

        // Verificar reset
        expect(screen.getByLabelText(/Título do Compromisso/i)).toHaveValue('');
        expect(screen.getByLabelText(/Projeto/i)).toHaveValue('');
    });

    it('should NOT reset form when onSubmit fails', async () => {
        const handleSubmit = vi.fn().mockReturnValue(false);
        render(<CommitmentForm onSubmit={handleSubmit} />);

        // Preencher campos para passar pela validação nativa do HTML
        fireEvent.change(screen.getByLabelText(/Título do Compromisso/i), { target: { value: 'Compromisso Falho' } });
        fireEvent.change(screen.getByLabelText(/Projeto/i), { target: { value: 'Projeto Erro' } });
        fireEvent.change(screen.getByLabelText(/Área Responsável/i), { target: { value: 'TI' } });
        fireEvent.change(screen.getByLabelText(/Owner \(Quem entrega\)/i), { target: { value: 'Daniel' } });
        fireEvent.change(screen.getByLabelText(/Stakeholder \(Quem recebe\)/i), { target: { value: 'QA' } });
        fireEvent.change(screen.getByLabelText(/Data de Entrega/i), { target: { value: '2026-01-01' } });

        fireEvent.click(screen.getByRole('button', { name: /Garantir Compromisso/i }));

        expect(handleSubmit).toHaveBeenCalled();
        // Não deve resetar
        expect(screen.getByLabelText(/Título do Compromisso/i)).toHaveValue('Compromisso Falho');
    });
});
