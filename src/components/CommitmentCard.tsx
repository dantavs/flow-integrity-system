'use client';

import React from 'react';
import { Commitment, CommitmentStatus, riskMatrixScore } from '../models/Commitment';

interface CommitmentCardProps {
    commitment: Commitment;
    index: number;
    onStatusChange?: (id: string, newStatus: CommitmentStatus) => void;
    onEdit?: (id: string) => void;
    onViewHistory?: (id: string) => void;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({ commitment: c, index, onStatusChange, onEdit, onViewHistory }) => {
    const dependencies = c.dependencias || [];
    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'DELIVERY': return '🏁';
            case 'ALIGNMENT': return '🤝';
            case 'DECISION': return '⚖️';
            case 'OP': return '⚙️';
            default: return '📄';
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
                                ✏️
                            </button>
                        )}
                        {onViewHistory && (
                            <button
                                onClick={() => onViewHistory(c.id)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px' }}
                                title="Ver Histórico"
                                aria-label="Histórico"
                            >
                                🕒
                            </button>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{c.id}</span>
                    </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{c.titulo}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{c.projeto} • {c.area}</p>

                {c.riscos.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', backgroundColor: 'rgba(139, 92, 246, 0.05)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', borderLeft: '2px solid var(--accent-primary)' }}>
                        <strong>⚠️ Riscos ({c.riscos.length})</strong>
                        <ul style={{ marginTop: '0.4rem', marginBottom: 0, paddingLeft: '1rem' }}>
                            {c.riscos.slice(0, 2).map(risk => (
                                <li key={risk.id}>
                                    {risk.descricao} ({risk.categoria} • {risk.statusMitigacao} • Score {riskMatrixScore(risk)})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {dependencies.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.7rem' }}>
                        <strong>🔗 Dependências:</strong> {dependencies.map(id => `#${id}`).join(', ')}
                    </div>
                )}

                {c.hasImpedimento && dependencies.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginBottom: '0.8rem' }}>
                        Dependência pendente detectada.
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
                        <span>📅</span>
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
