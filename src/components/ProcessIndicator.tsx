'use client';

import React from 'react';

interface ProcessIndicatorProps {
    label: string;
    loading: boolean;
    error: string | null;
    success: boolean;
}

export const ProcessIndicator: React.FC<ProcessIndicatorProps> = ({ label, loading, error, success }) => {
    return (
        <div className="card" style={{ marginBottom: '1rem', borderLeft: `4px solid ${loading ? 'var(--accent)' : error ? 'var(--error)' : success ? 'var(--success)' : 'var(--border)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{label}</h4>
                <span>
                    {loading && <span className="spinning">⏳ Cargando...</span>}
                    {error && <span style={{ color: 'var(--error)' }}>❌ Error</span>}
                    {success && <span style={{ color: 'var(--success)' }}>✅ Completado</span>}
                    {!loading && !error && !success && <span style={{ color: 'var(--muted-foreground)' }}>Esperando...</span>}
                </span>
            </div>
            {error && <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '0.5rem' }}>{error}</p>}

            <style jsx>{`
        .spinning {
          display: inline-block;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};
