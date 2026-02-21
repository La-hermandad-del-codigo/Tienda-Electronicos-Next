'use client';

import React from 'react';

export type ProcessStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ProcessTask {
    id: string;
    label: string;
    status: ProcessStatus;
    detail?: string;
}

interface ProcessIndicatorProps {
    tasks: ProcessTask[];
    onDismiss?: () => void;
}

const statusIcon: Record<ProcessStatus, string> = {
    idle: '⏳',
    loading: '🔄',
    success: '✅',
    error: '❌',
};

const statusClass: Record<ProcessStatus, string> = {
    idle: 'proc-task--idle',
    loading: 'proc-task--loading',
    success: 'proc-task--success',
    error: 'proc-task--error',
};

export const ProcessIndicator: React.FC<ProcessIndicatorProps> = ({ tasks, onDismiss }) => {
    const allDone = tasks.every(t => t.status === 'success' || t.status === 'error');
    const hasError = tasks.some(t => t.status === 'error');
    const anyLoading = tasks.some(t => t.status === 'loading');

    return (
        <div className={`process-indicator ${hasError ? 'pi-has-error' : ''} ${allDone && !hasError ? 'pi-done' : ''}`}>
            <div className="pi-header">
                <span className="pi-header-icon">
                    {anyLoading ? '⚙️' : hasError ? '⚠️' : '✅'}
                </span>
                <span className="pi-header-title">
                    {anyLoading
                        ? 'Procesando...'
                        : hasError
                            ? 'Completado con errores'
                            : 'Listo'}
                </span>
                {allDone && onDismiss && (
                    <button className="pi-dismiss" onClick={onDismiss} aria-label="Cerrar">✕</button>
                )}
            </div>

            <ul className="pi-task-list">
                {tasks.map(task => (
                    <li key={task.id} className={`pi-task ${statusClass[task.status]}`}>
                        <span className={`pi-task-icon ${task.status === 'loading' ? 'spin' : ''}`}>
                            {statusIcon[task.status]}
                        </span>
                        <span className="pi-task-label">{task.label}</span>
                        {task.detail && (
                            <span className="pi-task-detail">{task.detail}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
