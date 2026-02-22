'use client';

import React, { useState, useEffect } from 'react';
import CommitmentForm from '../components/CommitmentForm';
import CommitmentList from '../components/CommitmentList';
import { createCommitment, CreateCommitmentDTO } from '../services/CommitmentService';
import { loadCommitments, saveCommitments } from '../services/PersistenceService';
import { Commitment, CommitmentStatus } from '../models/Commitment';
import Toast, { ToastType } from '../components/Toast';

export default function Home() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Carregar dados iniciais
  useEffect(() => {
    const data = loadCommitments();
    setCommitments(data);
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
      setCommitments(prev => [...prev, newCommitment]);
      setToast({ message: 'Compromisso registrado com sucesso! ✨', type: 'SUCCESS' });
      return true;
    } catch (error: any) {
      setToast({ message: error.message, type: 'ERROR' });
      return false;
    }
  };

  const handleStatusUpdate = (id: string, newStatus: CommitmentStatus) => {
    setCommitments(prev => prev.map(c =>
      c.id === id ? { ...c, status: newStatus } : c
    ));
    setToast({ message: `Status do fluxo #${id} atualizado com sucesso.`, type: 'INFO' });
  };

  const activeCommitments = commitments
    .filter(c => c.status === CommitmentStatus.ACTIVE || c.status === CommitmentStatus.BACKLOG)
    .sort((a, b) => new Date(a.dataEsperada).getTime() - new Date(b.dataEsperada).getTime());

  const archivedCommitments = commitments
    .filter(c => c.status === CommitmentStatus.DONE || c.status === CommitmentStatus.CANCELLED)
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const currentCommitments = viewMode === 'ACTIVE' ? activeCommitments : archivedCommitments;

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
            <CommitmentForm onSubmit={handleCreateCommitment} />
          </div>
        </section>

        {/* Section: Listagem */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Gestão de Fluxos</h2>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setViewMode('ACTIVE')}
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
            </div>
          </div>

          <CommitmentList
            commitments={currentCommitments}
            onStatusChange={handleStatusUpdate}
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
    </div>
  );
}
