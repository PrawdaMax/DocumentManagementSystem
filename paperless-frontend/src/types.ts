export type DocumentStatus = 'RECEIVED' | 'PROCESSING' | 'IN_REVIEW' | 'DONE' | 'REJECTED' | 'ARCHIVED';

export interface DocumentDto {
    id: number;
    title: string;
    fileName: string | null;
    contentType: string | null;
    fileSize: number | null;
    uploadedAt: string;
    status: DocumentStatus;
    // OCR-Text, null (oder fehlend) solange der OCR-Worker noch arbeitet
    content?: string | null;
    // GenAI-Zusammenfassung bzw. Fehlermeldung, fehlen ganz bei einem Server ohne GenAI-Worker
    summary?: string | null;
    summaryError?: string | null;
}

export interface DocumentUpdateDto {
    title: string;
}

export interface DocumentHistoryDto {
    id: number;
    status: DocumentStatus;
    changedAt: string;
    comment: string | null;
    changedBy?: string | null;
}