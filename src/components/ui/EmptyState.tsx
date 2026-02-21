'use client';

import React from 'react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📦',
    title,
    description,
    action,
}) => {
    return (
        <div className="empty-state">
            <span className="empty-state-icon">{icon}</span>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
            {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
        </div>
    );
};
