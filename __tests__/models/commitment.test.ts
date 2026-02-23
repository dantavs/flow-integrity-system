import { CommitmentStatus } from '@/models/Commitment';
import { createCommitment } from '@/services/CommitmentService';

describe('Commitment Business Rules', () => {
    const validBaseData = {
        titulo: 'Compromisso Válido',
        projeto: 'Projeto X',
        area: 'Área Y',
        owner: 'Daniel',
        stakeholder: 'Stakeholder Z',
        dependencias: [],
        dataEsperada: new Date(Date.now() + 86400000),
        tipo: 'DELIVERY' as const,
        impacto: 'MEDIUM' as const,
        riscos: [{
            id: 'r1',
            descricao: 'Dependência externa crítica',
            categoria: 'DEPENDENCIA' as const,
            statusMitigacao: 'ABERTO' as const,
            probabilidade: 'HIGH' as const,
            impacto: 'HIGH' as const,
        }],
    };

    it('BR-001 & BR-002: should auto-generate ID, criadoEm date, and default to BACKLOG status', () => {
        const commitment = createCommitment(validBaseData, []);
        expect(commitment.id).toBeDefined();
        expect(commitment.id).toBe('1');
        expect(commitment.criadoEm).toBeInstanceOf(Date);
        expect(commitment.status).toBe(CommitmentStatus.BACKLOG);
    });

    it('BR-004: should throw error if titulo is empty', () => {
        const invalidData = { ...validBaseData, titulo: '' };
        expect(() => createCommitment(invalidData, [])).toThrow('Título é obrigatório');
    });

    it('BR-003: should throw error if dataEsperada is in the past', () => {
        const pastDate = new Date(Date.now() - 86400000);
        const invalidData = { ...validBaseData, dataEsperada: pastDate };
        expect(() => createCommitment(invalidData, [])).toThrow('A data esperada não pode estar no passado');
    });

    it('should increment ID based on existing commitments', () => {
        const existingIds = ['1', '2'];
        const commitment = createCommitment(validBaseData, existingIds);
        expect(commitment.id).toBe('3');
    });
});
