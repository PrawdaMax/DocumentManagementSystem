import { StyleSheet } from 'react-native';
import type { DocumentStatus } from '@/api';

export const COLORS = {
    primary: '#4f46e5',
    primaryLight: '#c7d2fe',
    summaryBackground: '#eef2ff',
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

export const FORM = StyleSheet.create({
    field: { gap: 4 },
    label: { fontSize: 12, fontWeight: '600', color: COLORS.label },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: COLORS.text,
    },
});

interface StatusInfo {
    label: string;
    background: string;
    color: string;
    next: DocumentStatus[];
    canEdit: boolean;
    canDelete: boolean;
}

export const STATUS: Record<DocumentStatus, StatusInfo> = {
    RECEIVED: { label: 'Received', background: '#f1f5f9', color: '#1e293b', next: ['IN_REVIEW', 'REJECTED'], canEdit: true, canDelete: true },
    PROCESSING: { label: 'Processing', background: '#fef3c7', color: '#92400e', next: ['REJECTED'], canEdit: true, canDelete: false },
    IN_REVIEW: { label: 'In Review', background: '#dbeafe', color: '#1e40af', next: ['DONE', 'REJECTED'], canEdit: true, canDelete: false },
    DONE: { label: 'Done', background: '#d1fae5', color: '#065f46', next: ['ARCHIVED'], canEdit: true, canDelete: false },
    REJECTED: { label: 'Rejected', background: '#ffe4e6', color: '#9f1239', next: ['IN_REVIEW'], canEdit: true, canDelete: true },
    ARCHIVED: { label: 'Archived', background: '#f3e8ff', color: '#6b21a8', next: [], canEdit: false, canDelete: false },
};

export function lockHint(status: DocumentStatus) {
    if (!STATUS[status].canEdit) return 'Archived documents are read-only.';
    if (status === 'PROCESSING') return 'Text recognition and summary are running, then the status changes to In Review.';
    if (!STATUS[status].canDelete) return 'Only received or rejected documents can be deleted.';
    return null;
}

export function formatBytes(bytes: number | null): string {
    if (bytes === null) return 'Unknown size';
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleString();
}
