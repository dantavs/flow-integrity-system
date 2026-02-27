'use client';

import React, { useMemo, useState } from 'react';
import { Commitment, CommitmentStatus, riskMatrixScore } from '../models/Commitment';

interface CommitmentCardProps {
    commitment: Commitment;
    index: number;
    onStatusChange?: (id: string, newStatus: CommitmentStatus) => void;
    onEdit?: (id: string) => void;
    onViewHistory?: (id: string) => void;
    onRunPreMortem?: (id: string) => void;
    preMortemLoading?: boolean;
    onChecklistAdd?: (id: string, text: string) => void;
    onChecklistToggle?: (id: string, itemId: string) => void;
    onChecklistRemove?: (id: string, itemId: string) => void;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({
    commitment: c,
    index,
    onStatusChange,
    onEdit,
    onViewHistory,
    onRunPreMortem,
    preMortemLoading = false,
    onChecklistAdd,
    onChecklistToggle,
    onChecklistRemove,
}) => {
    const dependencies = c.dependencias || [];
    const checklist = c.checklist || [];
    const checklistCompleted = useMemo(() => checklist.filter(item => item.completed).length, [checklist]);
    const isOpenCommitment = c.status === CommitmentStatus.BACKLOG || c.status === CommitmentStatus.ACTIVE;
    const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
    const [newChecklistText, setNewChecklistText] = useState('');

    const PencilIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m12 6 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const HistoryIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 3v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'DELIVERY': return 'D';
            case 'ALIGNMENT': return 'A';
            case 'DECISION': return 'D2';
            case 'OP': return 'OP';
            default: return 'C';
        }
    };

    const getDateColor = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return '#ef4444';
        if (diffDays <= 6) return '#f59e0b';
        return 'var(--accent-secondary)';
    };

    return (
        <div className="glass-card p-6 flex flex-col justify-between animate-fade-in" style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <select
                        value={c.status}
                        onChange={(e) => onStatusChange?.(c.id, e.target.value as CommitmentStatus)}
                        className={`status-badge ${c.status === 'ACTIVE' ? 'status-active' : 'status-backlog'}`}
                        style={{ border: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                    >
                        <option value={CommitmentStatus.BACKLOG}>BACKLOG</option>
                        <option value={CommitmentStatus.ACTIVE}>ACTIVE</option>
                        <option value={CommitmentStatus.DONE}>DONE</option>
                        <option value={CommitmentStatus.CANCELLED}>CANCELLED</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {onEdit && (
                            <button
                                onClick={() => onEdit(c.id)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px' }}
                                title="Editar Compromisso"
                                aria-label="Editar"
                            >
                                <PencilIcon />
                            </button>
                        )}
                        {onViewHistory && (
                            <button
                                onClick={() => onViewHistory(c.id)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px' }}
                                title="Ver Historico"
                                aria-label="Historico"
                            >
                                <HistoryIcon />
                            </button>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{c.id}</span>
                    </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{c.titulo}</h3>
                {c.descricao && c.descricao.trim() !== '' && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.7rem', whiteSpace: 'pre-wrap' }}>
                        {c.descricao}
                    </p>
                )}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{c.projeto} - {c.area}</p>

                {c.riscos.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', backgroundColor: 'rgba(139, 92, 246, 0.05)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', borderLeft: '2px solid var(--accent-primary)' }}>
                        <strong>Riscos ({c.riscos.length})</strong>
                        <ul style={{ marginTop: '0.4rem', marginBottom: 0, paddingLeft: '1rem' }}>
                            {c.riscos.slice(0, 2).map(risk => (
                                <li key={risk.id}>
                                    {risk.descricao} ({risk.categoria} | {risk.statusMitigacao} | Score {riskMatrixScore(risk)})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {dependencies.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.7rem' }}>
                        <strong>Dependencias:</strong> {dependencies.map(id => `#${id}`).join(', ')}
                    </div>
                )}

                {c.hasImpedimento && dependencies.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginBottom: '0.8rem' }}>
                        Dependencia pendente detectada.
                    </div>
                )}

                <div style={{ marginBottom: '0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.55rem 0.65rem' }}>
                    <button
                        type="button"
                        onClick={() => setIsChecklistExpanded(prev => !prev)}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                    >
                        <strong>Checklist:</strong> {checklistCompleted}/{checklist.length} {isChecklistExpanded ? 'v' : '>'}
                    </button>

                    {isChecklistExpanded && (
                        <div style={{ marginTop: '0.55rem' }}>
                            {isOpenCommitment && (
                                <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.55rem' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Novo item"
                                        value={newChecklistText}
                                        onChange={(e) => setNewChecklistText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key !== 'Enter') return;
                                            e.preventDefault();
                                            const text = newChecklistText.trim();
                                            if (!text || !onChecklistAdd) return;
                                            onChecklistAdd(c.id, text);
                                            setNewChecklistText('');
                                        }}
                                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.84rem' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        style={{ width: 'auto', padding: '0.3rem 0.65rem' }}
                                        onClick={() => {
                                            const text = newChecklistText.trim();
                                            if (!text || !onChecklistAdd) return;
                                            onChecklistAdd(c.id, text);
                                            setNewChecklistText('');
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                            )}

                            {checklist.length === 0 ? (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sem itens no checklist.</div>
                            ) : (
                                <div style={{ display: 'grid', gap: '0.35rem' }}>
                                    {checklist.map(item => (
                                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={() => onChecklistToggle?.(c.id, item.id)}
                                                disabled={!isOpenCommitment}
                                            />
                                            <span style={{ flex: 1, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                                                {item.text}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onChecklistRemove?.(c.id, item.id)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                                aria-label="Remover item"
                                                disabled={!isOpenCommitment}
                                            >
                                                x
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '0.6rem', marginBottom: '0.8rem' }}>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onRunPreMortem?.(c.id)}
                        disabled={!onRunPreMortem || preMortemLoading}
                        style={{ width: 'auto', padding: '0.35rem 0.65rem', opacity: preMortemLoading ? 0.85 : 1 }}
                    >
                        {preMortemLoading ? 'Analisando Pre-Mortem...' : 'Rodar Pre-Mortem'}
                    </button>
                </div>

                {c.preMortem && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.65rem' }}>
                        <div style={{ marginBottom: '0.35rem' }}>
                            <strong>Pre-Mortem:</strong> risco {c.preMortem.riskLevel}
                        </div>
                        {c.preMortem.causes.length > 0 && (
                            <div style={{ marginBottom: '0.25rem' }}>Causas: {c.preMortem.causes.join(' | ')}</div>
                        )}
                        {c.preMortem.criticalQuestions.length > 0 && (
                            <div style={{ marginBottom: '0.25rem' }}>Perguntas: {c.preMortem.criticalQuestions.join(' | ')}</div>
                        )}
                        {c.preMortem.mitigations.length > 0 && (
                            <div>Mitigacoes: {c.preMortem.mitigations.join(' | ')}</div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                    <span>Para: <strong style={{ color: 'var(--text-primary)' }}>{c.stakeholder}</strong></span>
                    <span>De: <strong style={{ color: 'var(--text-primary)' }}>{c.owner}</strong></span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <span>Data</span>
                        <span style={{ fontWeight: 600, color: getDateColor(c.dataEsperada) }}>
                            {new Date(c.dataEsperada).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--glass-bg)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{getTipoIcon(c.tipo)}</span>
                        {c.tipo}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CommitmentCard;
