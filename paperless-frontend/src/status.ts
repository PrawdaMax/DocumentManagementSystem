import type { DocumentStatus } from './types';

// "next" entspricht den erlaubten Wechseln in DocumentServiceImpl, der REST-Server prüft trotzdem jeden Wechsel
export const STATUS: Record<DocumentStatus, { label: string; color: string; next: DocumentStatus[] }> = {
    RECEIVED: { label: 'Received', color: 'bg-slate-100 text-slate-800', next: ['IN_REVIEW', 'REJECTED'] },
    IN_REVIEW: { label: 'In Review', color: 'bg-blue-100 text-blue-800', next: ['DONE', 'REJECTED'] },
    DONE: { label: 'Done', color: 'bg-emerald-100 text-emerald-800', next: ['ARCHIVED'] },
    REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-800', next: ['IN_REVIEW'] },
    ARCHIVED: { label: 'Archived', color: 'bg-purple-100 text-purple-800', next: [] },
};
