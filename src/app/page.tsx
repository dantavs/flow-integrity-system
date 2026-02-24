'use client';

import React, { useState, useEffect, useMemo } from 'react';
import CommitmentForm from '../components/CommitmentForm';
import CommitmentList from '../components/CommitmentList';
import AuditTimeline from '../components/AuditTimeline';
import { createCommitment, changeCommitmentStatus, editCommitment, CreateCommitmentDTO } from '../services/CommitmentService';
import {
  clearCommitmentsStorage,
  getAppEnvironment,
  getCommitmentsStorageKey,
  loadCommitments,
  loadReflectionFeedState,
  saveCommitments,
  saveReflectionFeedState
} from '../services/PersistenceService';
import { Commitment, CommitmentStatus } from '../models/Commitment';
import { calculateFlowHealth } from '../services/FlowHealthService';
import { buildWeeklyBrief } from '../services/WeeklyBriefService';
import { WEEKLY_BRIEF_BLOCKS, WeeklyBriefBlockKey } from '../services/WeeklyBriefContract';
import { buildReflectionFeed } from '../services/ReflectionEngine';
import { ReflectionAction, ReflectionItem } from '../services/ReflectionContract';
import Toast, { ToastType } from '../components/Toast';

export default function Home() {
  const appEnv = getAppEnvironment();
  const storageKey = getCommitmentsStorageKey();
  const applyDependencyIntegrity = (list: Commitment[]): Commitment[] => {
    const byId = new Map(list.map(c => [c.id, c]));
    return list.map(c => {
      const hasPendingDependency = (c.dependencias || []).some(depId => {
        const dep = byId.get(depId);
        if (!dep) return false;
        return dep.status !== CommitmentStatus.DONE && dep.status !== CommitmentStatus.CANCELLED;
      });
      return {
        ...c,
        hasImpedimento: hasPendingDependency,
      };
    });
  };

  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [selectedBriefBlock, setSelectedBriefBlock] = useState<WeeklyBriefBlockKey | null>(null);
  const [reflectionCooldownState, setReflectionCooldownState] = useState<Record<string, string>>({});
  const [reflectionFocusCommitmentId, setReflectionFocusCommitmentId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    projeto: '',
    owner: '',
    stakeholder: '',
    tipo: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const data = loadCommitments();
    setCommitments(applyDependencyIntegrity(data));
    setReflectionCooldownState(loadReflectionFeedState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salvar sempre que a lista mudar
  useEffect(() => {
    if (commitments.length > 0) {
      saveCommitments(commitments);
    }
  }, [commitments]);

  const handleCreateCommitment = (data: CreateCommitmentDTO) => {
    try {
      const existingIds = commitments.map(c => c.id);
      const newCommitment = createCommitment(data, existingIds);
      setCommitments(prev => applyDependencyIntegrity([...prev, newCommitment]));
      setToast({ message: 'Compromisso registrado com sucesso! ✨', type: 'SUCCESS' });
      return true;
    } catch (error: any) {
      setToast({ message: error.message, type: 'ERROR' });
      return false;
    }
  };

  const handleStatusUpdate = (id: string, newStatus: CommitmentStatus) => {
    setCommitments(prev => applyDependencyIntegrity(prev.map(c =>
      c.id === id ? changeCommitmentStatus(c, newStatus) : c
    )));
    setToast({ message: `Status do fluxo #${id} atualizado com sucesso.`, type: 'INFO' });
  };

  const handleEditCommitmentSubmit = (data: CreateCommitmentDTO) => {
    if (!editingId) return false;
    try {
      const commitmentToEdit = commitments.find(c => c.id === editingId);
      if (!commitmentToEdit) throw new Error('Compromisso não encontrado');

      const updatedCommitment = editCommitment(commitmentToEdit, data);

      setCommitments(prev => applyDependencyIntegrity(prev.map(c =>
        c.id === editingId ? updatedCommitment : c
      )));

      setToast({ message: 'Compromisso atualizado com sucesso! 📝', type: 'SUCCESS' });
      setEditingId(null);
      return true;
    } catch (error: any) {
      setToast({ message: error.message, type: 'ERROR' });
      return false;
    }
  };

  const handleDevClearBase = () => {
    const ok = window.confirm(
      `Confirma limpar a base local do ambiente ${appEnv.toUpperCase()}?\n` +
      `Chave: ${storageKey}\n\n` +
      'Essa ação não afeta o outro ambiente.'
    );
    if (!ok) return;

    clearCommitmentsStorage();
    setCommitments([]);
    setToast({ message: `Base local ${appEnv.toUpperCase()} limpa com sucesso.`, type: 'INFO' });
  };

  const activeCommitments = commitments
    .filter(c => c.status === CommitmentStatus.ACTIVE || c.status === CommitmentStatus.BACKLOG)
    .sort((a, b) => new Date(a.dataEsperada).getTime() - new Date(b.dataEsperada).getTime());

  const archivedCommitments = commitments
    .filter(c => c.status === CommitmentStatus.DONE || c.status === CommitmentStatus.CANCELLED)
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const applyFilters = (list: Commitment[]) => {
    return list.filter(c => {
      const matchProjeto = filters.projeto === '' || c.projeto === filters.projeto;
      const matchOwner = filters.owner === '' || c.owner === filters.owner;
      const matchStakeholder = filters.stakeholder === '' || c.stakeholder === filters.stakeholder;
      const matchTipo = filters.tipo === '' || c.tipo === filters.tipo;
      return matchProjeto && matchOwner && matchStakeholder && matchTipo;
    });
  };

  const weeklyBrief = useMemo(() => buildWeeklyBrief(commitments), [commitments]);
  const reflectionFeed = useMemo(
    () => buildReflectionFeed(commitments, new Date(), { cooldownByDedupKey: reflectionCooldownState }),
    [commitments, reflectionCooldownState],
  );
  const currentBaseList = viewMode === 'ACTIVE' ? activeCommitments : archivedCommitments;
  const currentCommitments = applyFilters(currentBaseList).filter(c => {
    if (reflectionFocusCommitmentId) return c.id === reflectionFocusCommitmentId;
    if (!selectedBriefBlock) return true;
    return weeklyBrief.blocks[selectedBriefBlock].ids.includes(c.id);
  });
  const flowHealth = calculateFlowHealth(commitments);

  // Extract unique values for filters
  const uniqueProjetos = Array.from(new Set(commitments.map(c => c.projeto))).sort();
  const uniqueOwners = Array.from(new Set(commitments.map(c => c.owner))).sort();
  const uniqueStakeholders = Array.from(new Set(commitments.map(c => c.stakeholder))).sort();
  const dependencyOptions = activeCommitments.map(c => ({
    id: c.id,
    titulo: c.titulo,
    status: c.status,
    projeto: c.projeto,
  }));

  const markReflectionAsSeen = (dedupKey: string) => {
    const next = {
      ...reflectionCooldownState,
      [dedupKey]: new Date().toISOString(),
    };
    setReflectionCooldownState(next);
    saveReflectionFeedState(next);
  };

  const handleReflectionAction = (reflection: ReflectionItem, action: ReflectionAction) => {
    markReflectionAsSeen(reflection.dedupKey);
    setViewMode('ACTIVE');

    if (action.type === 'FILTER_PROJECT' && action.projeto) {
      setReflectionFocusCommitmentId(null);
      setFilters(prev => ({ ...prev, projeto: action.projeto || '' }));
      setToast({ message: `Feed: foco aplicado no projeto "${action.projeto}".`, type: 'INFO' });
      return;
    }

    if (action.type === 'OPEN_COMMITMENT' && action.commitmentId) {
      setReflectionFocusCommitmentId(action.commitmentId);
      setSelectedBriefBlock(null);
      setToast({ message: `Feed: foco aplicado no compromisso #${action.commitmentId}.`, type: 'INFO' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        zIndex: -1,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '5%',
        left: '-5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
        zIndex: -1,
      }} />

      <header style={{ width: '100%', maxWidth: '800px', textAlign: 'center', marginBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '999px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: '1px solid var(--glass-border)',
              color: appEnv === 'prod' ? '#f59e0b' : '#06b6d4',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            Ambiente: {appEnv}
          </span>
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          Flow <span className="premium-gradient">Integrity</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          Sua central de compromissos inabaláveis. Onde a palavra empenhada se torna integridade processual.
        </p>
      </header>

      <main style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
        {/* Section: Formulaio */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Registrar Novo Compromisso</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          </div>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <CommitmentForm
              onSubmit={handleCreateCommitment}
              suggestions={{
                projetos: uniqueProjetos,
                owners: uniqueOwners,
                stakeholders: uniqueStakeholders
              }}
              dependencyOptions={dependencyOptions}
            />
            {appEnv === 'dev' && (
              <div style={{ marginTop: '0.8rem', textAlign: 'right' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                  Ação restrita ao ambiente atual ({storageKey}).
                </div>
                <button
                  type="button"
                  onClick={handleDevClearBase}
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '0.45rem 0.75rem' }}
                >
                  Limpar Base Local (DEV)
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Section: Listagem */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div
            className="glass-card"
            style={{
              padding: '1rem 1.2rem',
              marginBottom: '1.5rem',
              borderLeft: `4px solid ${flowHealth.level === 'HEALTHY' ? '#10b981' : flowHealth.level === 'ATTENTION' ? '#f59e0b' : '#ef4444'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Saúde do Fluxo</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{flowHealth.score}%</div>
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${flowHealth.score}%`,
                      height: '100%',
                      background: flowHealth.level === 'HEALTHY'
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : flowHealth.level === 'ATTENTION'
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #ef4444, #f87171)',
                    }}
                  />
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Ativos: {flowHealth.totalActive} | Vencidos: {flowHealth.breakdown.overdue} | Dependências pendentes: {flowHealth.breakdown.blockedByDependency} | Risco alto: {flowHealth.breakdown.highRisk} | Risco aberto: {flowHealth.breakdown.openRisk} | Reincidentes: {flowHealth.breakdown.recurrent}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Resumo Semanal</h2>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.8rem',
            }}>
              {WEEKLY_BRIEF_BLOCKS.map(block => {
                const isSelected = selectedBriefBlock === block.key;
                const tone = block.key === 'AT_RISK' || block.key === 'BLOCKED'
                  ? '#ef4444'
                  : block.key === 'RECURRENT'
                    ? '#f59e0b'
                    : '#06b6d4';
                return (
                  <button
                    key={block.key}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedBriefBlock(null);
                        return;
                      }
                      setSelectedBriefBlock(block.key);
                      setViewMode(block.key === 'RECENT_COMPLETED' ? 'ARCHIVED' : 'ACTIVE');
                    }}
                    className="glass-card"
                    style={{
                      textAlign: 'left',
                      padding: '0.85rem',
                      border: `1px solid ${isSelected ? tone : 'var(--glass-border)'}`,
                      background: isSelected ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                    }}
                    title={block.description}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      {block.label}
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: isSelected ? tone : 'var(--text-primary)' }}>
                      {weeklyBrief.blocks[block.key].total}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '1.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Feed de Reflexões</h2>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
            </div>
            {reflectionFeed.items.length === 0 ? (
              <div className="glass-card" style={{ padding: '1rem 1.1rem', color: 'var(--text-secondary)' }}>
                Sem reflexões críticas no momento.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
                {reflectionFeed.items.map(reflection => (
                  <div key={reflection.id} className="glass-card" style={{ padding: '0.9rem 1rem', borderLeft: `3px solid ${reflection.severity === 'HIGH' ? '#ef4444' : reflection.severity === 'MEDIUM' ? '#f59e0b' : '#06b6d4'}` }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>{reflection.message}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.55rem' }}>{reflection.context}</div>
                    <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                      {reflection.actions.map((action, idx) => (
                        <button
                          key={`${reflection.id}-${idx}`}
                          type="button"
                          className="tab-inactive"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '16px',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            border: '1px solid var(--glass-border)',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => handleReflectionAction(reflection, action)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Gestão de Fluxos</h2>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setViewMode('ACTIVE');
                  if (selectedBriefBlock === 'RECENT_COMPLETED') setSelectedBriefBlock(null);
                }}
                className={viewMode === 'ACTIVE' ? 'tab-active' : 'tab-inactive'}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid var(--glass-border)',
                  transition: 'all 0.3s ease'
                }}
              >
                Ativos ({activeCommitments.length})
              </button>
              <button
                onClick={() => setViewMode('ARCHIVED')}
                className={viewMode === 'ARCHIVED' ? 'tab-active' : 'tab-inactive'}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid var(--glass-border)',
                  transition: 'all 0.3s ease'
                }}
              >
                Arquivados ({archivedCommitments.length})
              </button>
              {selectedBriefBlock && (
                <button
                  type="button"
                  onClick={() => setSelectedBriefBlock(null)}
                  className="tab-inactive"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: '1px solid var(--glass-border)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Limpar Brief
                </button>
              )}
              {reflectionFocusCommitmentId && (
                <button
                  type="button"
                  onClick={() => setReflectionFocusCommitmentId(null)}
                  className="tab-inactive"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: '1px solid var(--glass-border)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Limpar Foco Feed
                </button>
              )}
            </div>

            {/* Filtros */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ flex: '1 1 200px' }}>
                <select
                  className="input-field"
                  style={{ padding: '0.5rem' }}
                  value={filters.projeto}
                  onChange={(e) => setFilters(prev => ({ ...prev, projeto: e.target.value }))}
                >
                  <option value="">Todos os Projetos</option>
                  {uniqueProjetos.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <select
                  className="input-field"
                  style={{ padding: '0.5rem' }}
                  value={filters.owner}
                  onChange={(e) => setFilters(prev => ({ ...prev, owner: e.target.value }))}
                >
                  <option value="">Todos os Owners</option>
                  {uniqueOwners.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <select
                  className="input-field"
                  style={{ padding: '0.5rem' }}
                  value={filters.stakeholder}
                  onChange={(e) => setFilters(prev => ({ ...prev, stakeholder: e.target.value }))}
                >
                  <option value="">Todos os Stakeholders</option>
                  {uniqueStakeholders.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <select
                  className="input-field"
                  style={{ padding: '0.5rem' }}
                  value={filters.tipo}
                  onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
                >
                  <option value="">Todos os Tipos</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="ALIGNMENT">Alinhamento</option>
                  <option value="DECISION">Decisão</option>
                  <option value="OP">OP</option>
                </select>
              </div>
              {(filters.projeto || filters.owner || filters.stakeholder || filters.tipo) && (
                <button
                  onClick={() => setFilters({ projeto: '', owner: '', stakeholder: '', tipo: '' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          <CommitmentList
            commitments={currentCommitments}
            onStatusChange={handleStatusUpdate}
            onEdit={setEditingId}
            onViewHistory={setHistoryId}
          />
        </section>
      </main>

      <footer style={{ marginTop: '8rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>&copy; 2026 Flow Integrity System. A cultura de compromisso levada a sério.</p>
      </footer>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {editingId && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingId(null) }}>
          <div className="modal-content modal-content-form">
            <button className="modal-close" onClick={() => setEditingId(null)}>×</button>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Editar Compromisso #{editingId}</h2>
              <CommitmentForm
                initialData={commitments.find(c => c.id === editingId)}
                onSubmit={handleEditCommitmentSubmit}
                onCancel={() => setEditingId(null)}
                layoutMode="modal"
                suggestions={{
                  projetos: uniqueProjetos,
                  owners: uniqueOwners,
                  stakeholders: uniqueStakeholders
                }}
                dependencyOptions={dependencyOptions.filter(d => d.id !== editingId)}
              />
            </div>
          </div>
        </div>
      )}

      {historyId && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setHistoryId(null) }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setHistoryId(null)}>×</button>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Trilha de Auditoria
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Histórico imutável de eventos do compromisso #{historyId}
              </p>
              <AuditTimeline history={commitments.find(c => c.id === historyId)?.historico || []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
