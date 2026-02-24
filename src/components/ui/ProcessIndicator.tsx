'use client';

import React from 'react';
import { Hourglass, Loader2, CheckCircle, XCircle, AlertTriangle, Settings, X } from 'lucide-react';

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

const statusIcon: Record<ProcessStatus, React.ReactNode> = {
    idle: <Hourglass size={16} />,
    loading: <Loader2 size={16} className="spin" />,
    success: <CheckCircle size={16} />,
    error: <XCircle size={16} />,
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
                <span className="pi-header-icon" style={{ display: 'flex' }}>
                    {anyLoading ? <Settings size={20} className="spin" /> : hasError ? <AlertTriangle size={20} className="text-danger" /> : <CheckCircle size={20} className="text-success" />}
                </span>
                <span className="pi-header-title">
                    {anyLoading
                        ? 'Procesando...'
                        : hasError
                            ? 'Completado con errores'
                            : 'Listo'}
                </span>
                {allDone && onDismiss && (
                    <button className="pi-dismiss" onClick={onDismiss} aria-label="Cerrar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            <ul className="pi-task-list">
                {tasks.map(task => (
                    <li key={task.id} className={`pi-task ${statusClass[task.status]}`}>
                        <span className="pi-task-icon" style={{ display: 'flex' }}>
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
