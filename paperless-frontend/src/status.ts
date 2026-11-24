import type { DocumentStatus } from './types';

// "next" entspricht den erlaubten Wechseln in DocumentServiceImpl, der REST-Server prüft trotzdem jeden Wechsel
interface StatusInfo {
    label: string;
    color: string;
    next: DocumentStatus[];
    canEdit: boolean;
    canDelete: boolean;
}

export const STATUS: Record<DocumentStatus, StatusInfo> = {
    RECEIVED: { label: 'Received', color: 'bg-slate-100 text-slate-800', next: ['IN_REVIEW', 'REJECTED'], canEdit: true, canDelete: true },
    PROCESSING: { label: 'Processing', color: 'bg-amber-100 text-amber-800', next: ['REJECTED'], canEdit: true, canDelete: false },
    IN_REVIEW: { label: 'In Review', color: 'bg-blue-100 text-blue-800', next: ['DONE', 'REJECTED'], canEdit: true, canDelete: false },
    DONE: { label: 'Done', color: 'bg-emerald-100 text-emerald-800', next: ['ARCHIVED'], canEdit: true, canDelete: false },
    REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-800', next: ['IN_REVIEW'], canEdit: true, canDelete: true },
    ARCHIVED: { label: 'Archived', color: 'bg-purple-100 text-purple-800', next: [], canEdit: false, canDelete: false },
};
