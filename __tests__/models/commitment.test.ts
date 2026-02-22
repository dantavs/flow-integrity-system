import { CommitmentStatus } from '../../src/models/Commitment';

describe('Commitment Model', () => {
    it('should create a valid commitment object', () => {
        const commitment = {
            id: '1',
            titulo: 'Finalizar Protótipo',
            projeto: 'Flow Integrity',
            area: 'Desenvolvimento',
            owner: 'Daniel',
            stakeholder: 'Time de Produto',
            dataEsperada: new Date('2026-03-01'),
            tipo: 'DELIVERY',
            impacto: 'HIGH',
            status: CommitmentStatus.ACTIVE,
            hasImpedimento: false,
            riscos: 'Complexidade na integração',
            criadoEm: new Date(),
        };

        expect(commitment.id).toBe('1');
        expect(commitment.titulo).toBe('Finalizar Protótipo');
        expect(commitment.hasImpedimento).toBe(false);
    });
});
