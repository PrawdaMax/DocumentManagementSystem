import type { DocumentStatus } from '@/api';

export const COLORS = {
    primary: '#4f46e5',
    primaryLight: '#c7d2fe',
    background: '#f8fafc',
    card: '#ffffff',
    border: '#cbd5e1',
    divider: '#f1f5f9',
    text: '#1e293b',
    label: '#475569',
    muted: '#64748b',
    light: '#94a3b8',
    danger: '#e11d48',
    errorBackground: '#fff1f2',
    errorText: '#9f1239',
};

export const STATUS: Record<DocumentStatus, { label: string; background: string; color: string; next: DocumentStatus[] }> = {
    RECEIVED: { label: 'Received', background: '#f1f5f9', color: '#1e293b', next: ['IN_REVIEW', 'REJECTED'] },
    IN_REVIEW: { label: 'In Review', background: '#dbeafe', color: '#1e40af', next: ['DONE', 'REJECTED'] },
    DONE: { label: 'Done', background: '#d1fae5', color: '#065f46', next: ['ARCHIVED'] },
    REJECTED: { label: 'Rejected', background: '#ffe4e6', color: '#9f1239', next: ['IN_REVIEW'] },
    ARCHIVED: { label: 'Archived', background: '#f3e8ff', color: '#6b21a8', next: [] },
};

export function formatBytes(bytes: number | null): string {
    if (bytes === null) return 'Unknown size';
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleString();
}
