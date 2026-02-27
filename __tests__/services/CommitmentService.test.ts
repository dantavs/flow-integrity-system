// __tests__/services/CommitmentService.test.ts
import { editCommitment, createCommitment, CreateCommitmentDTO } from '../../src/services/CommitmentService';
import { Commitment, CommitmentStatus, CommitmentType, CommitmentImpact } from '../../src/models/Commitment';

describe('CommitmentService - editCommitment', () => {
    const baseCommitment: Commitment = {
        id: 'c1',
        titulo: 'Entregar API',
        descricao: 'Escopo inicial da API.',
        projeto: 'Flow',
        area: 'Backend',
        owner: 'Alice',
        stakeholder: 'Bob',
        dependencias: [],
        dataEsperada: new Date('2026-03-15'),
        tipo: 'DELIVERY' as CommitmentType,
        impacto: 'MEDIUM' as CommitmentImpact,
        status: CommitmentStatus.ACTIVE,
        hasImpedimento: false,
        checklist: [],
        riscos: [],
        renegociadoCount: 0,
        criadoEm: new Date(),
        historico: [],
    };

    const newData: CreateCommitmentDTO = {
        titulo: 'Entregar API v2',
        descricao: 'Expandir endpoint e cobertura.',
        projeto: 'Flow',
        area: 'Backend',
        owner: 'Alice',
        stakeholder: 'Bob',
        dependencias: ['dep-1'],
        dataEsperada: new Date('2026-04-01'),
        tipo: 'DELIVERY',
        impacto: 'MEDIUM',
        riscos: [{
            id: 'r-1',
            descricao: 'Dependencia de terceiro',
            categoria: 'DEPENDENCIA',
            statusMitigacao: 'EM_MITIGACAO',
            probabilidade: 'MEDIUM',
            impacto: 'HIGH',
        }],
    };

    test('edits title/date and creates renegotiation event', () => {
        const edited = editCommitment(baseCommitment, newData);
        expect(edited.titulo).toBe(newData.titulo);
        expect(edited.dataEsperada.getTime()).toBe(newData.dataEsperada.getTime());
        expect(edited.historico).toHaveLength(1);
        expect(edited.historico[0].tipo).toBe('RENEGOTIATION');
        expect(edited.renegociadoCount).toBe(1);
        expect(edited.riscos).toHaveLength(1);
    });

    test('throws error when title is empty', () => {
        const badData = { ...newData, titulo: '' } as CreateCommitmentDTO;
        expect(() => editCommitment(baseCommitment, badData)).toThrow(/obrigat/i);
    });

    test('throws error when dataEsperada is missing', () => {
        const badData = { ...newData, dataEsperada: undefined as any } as CreateCommitmentDTO;
        expect(() => editCommitment(baseCommitment, badData)).toThrow(/entrega/i);
    });

    test('normalizes legacy textual risk on creation', () => {
        const dto = { ...newData, riscos: 'Risco textual legado' as any };
        const created = createCommitment(dto, []);
        expect(created.riscos).toHaveLength(1);
        expect(created.riscos[0].descricao).toBe('Risco textual legado');
    });
});
