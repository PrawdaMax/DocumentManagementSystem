import type { DocumentDto } from './types';

export type SummaryState = 'waiting-for-ocr' | 'pending' | 'done' | 'failed' | 'unavailable';

// "unavailable": der Server kennt die Felder summary/summaryError noch nicht (Sprint-4-Stand)
export function summaryState(doc: DocumentDto): SummaryState {
    if (doc.content == null) return 'waiting-for-ocr';
    if (doc.summary) return 'done';
    if (doc.summaryError) return 'failed';
    if (doc.summary === null && doc.summaryError === null) return 'pending';
    return 'unavailable';
}
