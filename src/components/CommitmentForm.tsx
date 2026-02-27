'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CreateCommitmentDTO } from '../services/CommitmentService';
import {
    Commitment,
    CommitmentStatus,
    CommitmentRisk,
    RiskCategory,
    RiskMatrixLevel,
    RiskMitigationStatus,
} from '../models/Commitment';

interface CommitmentFormProps {
    onSubmit: (data: CreateCommitmentDTO) => boolean;
    initialData?: Commitment;
    onCancel?: () => void;
    layoutMode?: 'default' | 'modal';
    suggestions?: {
        projetos: string[];
        owners: string[];
        stakeholders: string[];
    };
    dependencyOptions?: Array<{
        id: string;
        titulo: string;
        status: string;
        projeto?: string;
    }>;
    currentStatus?: CommitmentStatus;
    onStatusChange?: (status: CommitmentStatus) => void;
}

type CommitmentFormState = Omit<CreateCommitmentDTO, 'dataEsperada'> & {
    dataEsperada: string;
};

type AdvisorFeedback = {
    qualityScore: number;
    ambiguities: string[];
    riskHints: string[];
    rewriteSuggestions: string[];
    recommendedActions: string[];
    why: string;
};

const toLocalDateInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const createEmptyRisk = (id: string): CommitmentRisk => ({
    id,
    descricao: '',
    categoria: 'OUTRO',
    statusMitigacao: 'ABERTO',
    probabilidade: 'MEDIUM',
    impacto: 'MEDIUM',
});

const createInitialState = (): CommitmentFormState => ({
    titulo: '',
    descricao: '',
    projeto: '',
    area: '',
    owner: '',
    stakeholder: '',
    dependencias: [],
    dataEsperada: '',
    tipo: 'DELIVERY',
    impacto: 'MEDIUM',
    riscos: [createEmptyRisk('risk-1')],
});

const CommitmentForm: React.FC<CommitmentFormProps> = ({
    onSubmit,
    initialData,
    onCancel,
    layoutMode = 'default',
    suggestions,
    dependencyOptions = [],
    currentStatus,
    onStatusChange,
}) => {
    const nextRiskIdRef = useRef(2);
    const [todayMinDate, setTodayMinDate] = useState('');
    const [showRisks, setShowRisks] = useState(Boolean(initialData?.riscos?.length));
    const [showDependencies, setShowDependencies] = useState(false);
    const [dependencyQuery, setDependencyQuery] = useState('');
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const [advisorError, setAdvisorError] = useState<string | null>(null);
    const [advisorFeedback, setAdvisorFeedback] = useState<AdvisorFeedback | null>(null);

    const getNextRiskId = () => {
        const id = `risk-${nextRiskIdRef.current}`;
        nextRiskIdRef.current += 1;
        return id;
    };

    const defaultData: CommitmentFormState = initialData ? {
        titulo: initialData.titulo,
        descricao: initialData.descricao || '',
        projeto: initialData.projeto,
        area: initialData.area,
        owner: initialData.owner,
        stakeholder: initialData.stakeholder,
        dependencias: initialData.dependencias || [],
        dataEsperada: toLocalDateInput(
            initialData.dataEsperada instanceof Date
                ? initialData.dataEsperada
                : new Date(initialData.dataEsperada)
        ),
        tipo: initialData.tipo,
        impacto: initialData.impacto,
        riscos: initialData.riscos?.length ? initialData.riscos : [createEmptyRisk('risk-1')],
    } : createInitialState();

    const [formData, setFormData] = useState<CommitmentFormState>(defaultData);

    useEffect(() => {
        const today = toLocalDateInput(new Date());
        setTodayMinDate(today);

        if (!initialData) {
            setFormData(prev => (prev.dataEsperada ? prev : { ...prev, dataEsperada: today }));
        }

        const maxRiskNumber = formData.riscos.reduce((max, risk) => {
            const match = /^risk-(\d+)$/.exec(risk.id);
            if (!match) return max;
            return Math.max(max, Number(match[1]));
        }, 0);
        nextRiskIdRef.current = Math.max(nextRiskIdRef.current, maxRiskNumber + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const updateRisk = (riskId: string, field: keyof CommitmentRisk, value: string) => {
        setFormData(prev => ({
            ...prev,
            riscos: prev.riscos.map(risk => {
                if (risk.id !== riskId) return risk;
                return { ...risk, [field]: value } as CommitmentRisk;
            }),
        }));
    };

    const addRisk = () => {
        setFormData(prev => ({ ...prev, riscos: [...prev.riscos, createEmptyRisk(getNextRiskId())] }));
    };

    const removeRisk = (riskId: string) => {
        setFormData(prev => {
            const next = prev.riscos.filter(risk => risk.id !== riskId);
            return { ...prev, riscos: next.length ? next : [createEmptyRisk(getNextRiskId())] };
        });
    };

    const toggleDependency = (dependencyId: string) => {
        setFormData(prev => {
            const exists = prev.dependencias.includes(dependencyId);
            return {
                ...prev,
                dependencias: exists
                    ? prev.dependencias.filter(id => id !== dependencyId)
                    : [...prev.dependencias, dependencyId],
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.dataEsperada) return;

        const parsedDate = new Date(`${formData.dataEsperada}T00:00:00`);
        if (Number.isNaN(parsedDate.getTime())) return;

        const sanitizedRisks = formData.riscos
            .map(risk => ({ ...risk, descricao: risk.descricao.trim() }))
            .filter(risk => risk.descricao !== '');

        const success = onSubmit({
            ...formData,
            dataEsperada: parsedDate,
            riscos: sanitizedRisks,
        });

        if (success && !initialData) {
            nextRiskIdRef.current = 2;
            setFormData({
                ...createInitialState(),
                dataEsperada: todayMinDate || toLocalDateInput(new Date()),
            });
            setShowRisks(false);
            setShowDependencies(false);
            setAdvisorFeedback(null);
            setAdvisorError(null);
        }
    };

    const handleAnalyzeWithAI = async () => {
        setAdvisorLoading(true);
        setAdvisorError(null);

        try {
            const response = await fetch('/api/guardian/advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo: formData.titulo,
                    descricao: formData.descricao,
                    projeto: formData.projeto,
                    owner: formData.owner,
                    stakeholder: formData.stakeholder,
                    dataEsperada: formData.dataEsperada,
                    tipo: formData.tipo,
                    impacto: formData.impacto,
                    riscos: formData.riscos.map(risk => risk.descricao).filter(text => text.trim() !== ''),
                    dependencias: formData.dependencias,
                    dependencyContext: dependencyOptions
                        .filter(dep => formData.dependencias.includes(dep.id))
                        .map(dep => ({
                            id: dep.id,
                            titulo: dep.titulo,
                            projeto: dep.projeto,
                            status: dep.status,
                        })),
                }),
            });

            const payload = await response.json() as any;

            if (payload.status === 'ok' && payload.result) {
                setAdvisorFeedback(payload.result as AdvisorFeedback);
                return;
            }

            setAdvisorFeedback(null);
            setAdvisorError(payload.reason || 'Advisor indisponível no momento.');
        } catch {
            setAdvisorFeedback(null);
            setAdvisorError('Falha ao analisar com IA no momento.');
        } finally {
            setAdvisorLoading(false);
        }
    };

    const categoryOptions: { value: RiskCategory; label: string }[] = [
        { value: 'PRAZO', label: 'Prazo' },
        { value: 'ESCOPO', label: 'Escopo' },
        { value: 'DEPENDENCIA', label: 'Dependência' },
        { value: 'RECURSOS', label: 'Recursos' },
        { value: 'QUALIDADE', label: 'Qualidade' },
        { value: 'NEGOCIO', label: 'Negócio' },
        { value: 'OUTRO', label: 'Outro' },
    ];

    const statusOptions: { value: RiskMitigationStatus; label: string }[] = [
        { value: 'ABERTO', label: 'Aberto' },
        { value: 'EM_MITIGACAO', label: 'Em mitigação' },
        { value: 'MITIGADO', label: 'Mitigado' },
        { value: 'ACEITO', label: 'Aceito' },
    ];

    const matrixOptions: { value: RiskMatrixLevel; label: string }[] = [
        { value: 'LOW', label: 'Baixa' },
        { value: 'MEDIUM', label: 'Média' },
        { value: 'HIGH', label: 'Alta' },
    ];

    return (
        <form
            onSubmit={handleSubmit}
            className={`glass-card p-8 w-full animate-fade-in commitment-form-root ${layoutMode === 'modal' ? 'commitment-form-modal' : ''}`}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 commitment-main-block">
                <div className="space-y-1">
                    <label htmlFor="titulo">Título do Compromisso</label>
                    <input type="text" id="titulo" name="titulo" placeholder="O que será entregue?" value={formData.titulo} onChange={handleChange} className="input-field" required />
                </div>

                <div className="space-y-1" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="descricao">Descrição</label>
                    <textarea
                        id="descricao"
                        name="descricao"
                        placeholder="Detalhe o escopo, critérios de aceite e contexto principal"
                        value={formData.descricao}
                        onChange={handleChange}
                        className="input-field"
                        style={{ minHeight: '88px', resize: 'vertical' }}
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="projeto">Projeto</label>
                    <input type="text" id="projeto" name="projeto" placeholder="ex: Flow v1" value={formData.projeto} onChange={handleChange} className="input-field" list="projetos-list" />
                    <datalist id="projetos-list">{suggestions?.projetos.map(p => <option key={p} value={p} />)}</datalist>
                </div>

                <div className="space-y-1">
                    <label htmlFor="area">Área Responsável</label>
                    <input type="text" id="area" name="area" placeholder="ex: Engenharia" value={formData.area} onChange={handleChange} className="input-field" />
                </div>

                <div className="space-y-1">
                    <label htmlFor="owner">Owner (Quem entrega)</label>
                    <input type="text" id="owner" name="owner" placeholder="Nome da pessoa" value={formData.owner} onChange={handleChange} className="input-field" required list="owners-list" />
                    <datalist id="owners-list">{suggestions?.owners.map(o => <option key={o} value={o} />)}</datalist>
                </div>

                <div className="space-y-1">
                    <label htmlFor="stakeholder">Stakeholder (Quem recebe)</label>
                    <input type="text" id="stakeholder" name="stakeholder" placeholder="ex: CEO, Time de QA" value={formData.stakeholder} onChange={handleChange} className="input-field" required list="stakeholders-list" />
                    <datalist id="stakeholders-list">{suggestions?.stakeholders.map(s => <option key={s} value={s} />)}</datalist>
                </div>

                <div className="space-y-1">
                    <label htmlFor="dataEsperada">Data de Entrega</label>
                    <input type="date" id="dataEsperada" name="dataEsperada" value={formData.dataEsperada} onChange={handleChange} className="input-field" min={todayMinDate} required />
                </div>

                <div className="space-y-1">
                    <label htmlFor="tipo">Tipo de Fluxo</label>
                    <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} className="input-field">
                        <option value="DELIVERY">🏁 Delivery</option>
                        <option value="ALIGNMENT">🤝 Alignment</option>
                        <option value="DECISION">⚖️ Decision</option>
                        <option value="OP">⚙️ Operational</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label htmlFor="impacto">Impacto Sistêmico</label>
                    <select id="impacto" name="impacto" value={formData.impacto} onChange={handleChange} className="input-field">
                        <option value="LOW">Low Impact</option>
                        <option value="MEDIUM">Medium Impact</option>
                        <option value="HIGH">High Impact</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>

                {initialData && currentStatus && onStatusChange && (
                    <div className="space-y-1">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={currentStatus}
                            onChange={(e) => onStatusChange(e.target.value as CommitmentStatus)}
                            className="input-field"
                        >
                            <option value={CommitmentStatus.BACKLOG}>BACKLOG</option>
                            <option value={CommitmentStatus.ACTIVE}>ACTIVE</option>
                            <option value={CommitmentStatus.DONE}>DONE</option>
                            <option value={CommitmentStatus.CANCELLED}>CANCELLED</option>
                        </select>
                    </div>
                )}
            </div>

            <section className="space-y-3 commitment-main-block" style={{ border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontWeight: 600 }}>Checklist</div>
                        {!initialData ? (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                O checklist fica disponível após salvar o compromisso, na visualização do card.
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                Itens atuais: {(initialData.checklist || []).filter(item => item.completed).length}/{(initialData.checklist || []).length}. Edite pelo card para manter histórico de eventos.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="space-y-3 commitment-main-block" style={{ border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.8rem' }}>
                <button
                    type="button"
                    onClick={() => setShowRisks(prev => !prev)}
                    className="btn-secondary"
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem' }}
                    aria-expanded={showRisks}
                    aria-controls="risk-section"
                >
                    <span>Riscos e Considerações (Opcional)</span>
                    <span>{showRisks ? '−' : '+'}</span>
                </button>

                {showRisks && (
                    <div id="risk-section" className="space-y-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cadastre riscos apenas se necessário.</span>
                            <button type="button" onClick={addRisk} className="btn-secondary" style={{ width: 'auto', padding: '0.4rem 0.8rem' }}>
                                + Adicionar Risco
                            </button>
                        </div>

                        {formData.riscos.map((risk, idx) => (
                            <div key={risk.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.8rem', background: 'rgba(255,255,255,0.02)' }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 risk-fields-grid">
                                    <div className="space-y-1 risk-field" style={{ gridColumn: '1 / -1' }}>
                                        <label htmlFor={`risk-desc-${risk.id}`}>Descrição do risco #{idx + 1}</label>
                                        <textarea
                                            id={`risk-desc-${risk.id}`}
                                            value={risk.descricao}
                                            onChange={(e) => updateRisk(risk.id, 'descricao', e.target.value)}
                                            className="input-field"
                                            placeholder="Descreva o risco"
                                            style={{ minHeight: '72px', resize: 'vertical' }}
                                        />
                                    </div>

                                    <div className="space-y-1 risk-field">
                                        <label>Categoria</label>
                                        <select className="input-field" value={risk.categoria} onChange={(e) => updateRisk(risk.id, 'categoria', e.target.value)}>
                                            {categoryOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1 risk-field">
                                        <label>Status de mitigação</label>
                                        <select className="input-field" value={risk.statusMitigacao} onChange={(e) => updateRisk(risk.id, 'statusMitigacao', e.target.value)}>
                                            {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1 risk-field">
                                        <label>Probabilidade</label>
                                        <select className="input-field" value={risk.probabilidade} onChange={(e) => updateRisk(risk.id, 'probabilidade', e.target.value)}>
                                            {matrixOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1 risk-field">
                                        <label>Impacto (matriz)</label>
                                        <select className="input-field" value={risk.impacto} onChange={(e) => updateRisk(risk.id, 'impacto', e.target.value)}>
                                            {matrixOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginTop: '0.7rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => removeRisk(risk.id)} className="btn-secondary" style={{ width: 'auto', padding: '0.3rem 0.8rem' }}>
                                        Remover
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-3 commitment-main-block" style={{ border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.8rem' }}>
                <button
                    type="button"
                    onClick={() => setShowDependencies(prev => !prev)}
                    className="btn-secondary"
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem' }}
                    aria-expanded={showDependencies}
                    aria-controls="dependency-section"
                >
                    <span>Dependências (Opcional)</span>
                    <span>{showDependencies ? '−' : '+'}</span>
                </button>

                {showDependencies && (
                    <div id="dependency-section" className="space-y-3">
                        {dependencyOptions.length === 0 ? (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Nenhum compromisso elegível para dependência no momento.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Pesquisar por ID, título ou projeto..."
                                    value={dependencyQuery}
                                    onChange={(e) => setDependencyQuery(e.target.value)}
                                />
                                {dependencyOptions
                                    .filter(dep => {
                                        if (!dependencyQuery.trim()) return true;
                                        const q = dependencyQuery.toLowerCase();
                                        return (
                                            dep.id.toLowerCase().includes(q) ||
                                            dep.titulo.toLowerCase().includes(q) ||
                                            (dep.projeto || '').toLowerCase().includes(q)
                                        );
                                    })
                                    .map(dep => (
                                    <label key={dep.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0.6rem', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.dependencias.includes(dep.id)}
                                            onChange={() => toggleDependency(dep.id)}
                                        />
                                        <span style={{ fontSize: '0.9rem' }}>
                                            #{dep.id} - {dep.titulo} ({dep.status})
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            <section className="space-y-3 commitment-advisor-block" style={{ border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontWeight: 600 }}>Flow Advisor (IA)</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Analisa clareza e riscos do compromisso antes de salvar.</div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAnalyzeWithAI}
                        className="btn-secondary"
                        disabled={advisorLoading}
                        style={{ width: 'auto', padding: '0.45rem 0.85rem', opacity: advisorLoading ? 0.8 : 1 }}
                    >
                        {advisorLoading ? 'Analisando...' : 'Analisar com IA'}
                    </button>
                </div>

                {advisorError && (
                    <div style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                        {advisorError}
                    </div>
                )}

                {advisorFeedback && (
                    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            Qualidade estimada: <strong>{advisorFeedback.qualityScore}%</strong>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                            {advisorFeedback.why}
                        </div>
                        {advisorFeedback.ambiguities.length > 0 && (
                            <div style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                                Ambiguidades: {advisorFeedback.ambiguities.join(' | ')}
                            </div>
                        )}
                        {advisorFeedback.recommendedActions.length > 0 && (
                            <div style={{ marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                                Ações sugeridas: {advisorFeedback.recommendedActions.join(' | ')}
                            </div>
                        )}
                        {advisorFeedback.rewriteSuggestions.length > 0 && (
                            <div style={{ fontSize: '0.85rem' }}>
                                Sugestões de escrita: {advisorFeedback.rewriteSuggestions.join(' | ')}
                            </div>
                        )}
                    </div>
                )}
            </section>

            <div className="pt-4 flex gap-4 commitment-main-block">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-secondary w-full" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                )}
                <button type="submit" className="btn-primary w-full">
                    {initialData ? 'Salvar Alterações' : 'Garantir Compromisso'}
                </button>
            </div>
        </form>
    );
};

export default CommitmentForm;
