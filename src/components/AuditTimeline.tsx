'use client';

import React from 'react';
import { AuditEvent } from '../models/Commitment';

interface AuditTimelineProps {
    history: AuditEvent[];
}

const AuditTimeline: React.FC<AuditTimelineProps> = ({ history }) => {
    // Ordenar do mais recente para o mais antigo se não estiver
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const getEventIcon = (tipo: string) => {
        switch (tipo) {
            case 'CREATE': return '🌱';
            case 'STATUS_CHANGE': return '🔄';
            case 'EDIT': return '📝';
            case 'RENEGOTIATION': return '⏳';
            case 'checklist_item_added': return '➕';
            case 'checklist_item_completed': return '✅';
            case 'checklist_item_removed': return '🗑️';
            default: return '📌';
        }
    };

    return (
        <div style={{ padding: '0 1rem' }}>
            {sortedHistory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                    Nenhum registro encontrado.
                </p>
            ) : (
                <div style={{ position: 'relative' }}>
                    {/* Linha vertical da timeline */}
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        bottom: '1rem',
                        left: '1.25rem',
                        width: '2px',
                        backgroundColor: 'var(--glass-border)',
                        zIndex: 0
                    }} />

                    {sortedHistory.map((evt, idx) => (
                        <div key={evt.id} style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: idx === sortedHistory.length - 1 ? 0 : '1.5rem',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            {/* Círculo do ícone */}
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                borderRadius: '50%',
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                {getEventIcon(evt.tipo)}
                            </div>

                            {/* Cartão de conteúdo do evento */}
                            <div style={{
                                flex: 1,
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                padding: '1rem',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {evt.tipo.replace('_', ' ')}
                                    </h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(evt.timestamp).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                    {evt.descricao}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuditTimeline;
