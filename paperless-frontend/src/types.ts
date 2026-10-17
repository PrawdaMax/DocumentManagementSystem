export type DocumentStatus = 'RECEIVED' | 'IN_REVIEW' | 'DONE' | 'REJECTED' | 'ARCHIVED';

export interface DocumentDto {
    id: number;
    title: string;
    fileName: string | null;
    contentType: string | null;
    fileSize: number | null;
    uploadedAt: string;
    status: DocumentStatus;
}

export interface DocumentUpdateDto {
    title: string;
}

export interface DocumentHistoryDto {
    id: number;
    status: DocumentStatus;
    changedAt: string;
    comment: string | null;
}