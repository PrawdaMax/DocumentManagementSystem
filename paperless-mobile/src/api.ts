import Constants from 'expo-constants';

const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${host}/api/documents`;

export type DocumentStatus = 'RECEIVED' | 'IN_REVIEW' | 'DONE' | 'REJECTED' | 'ARCHIVED';

export interface DocumentDto {
    id: number;
    title: string;
    fileName: string | null;
    contentType: string | null;
    fileSize: number | null;
    uploadedAt: string;
    status: DocumentStatus;
    content?: string | null;
    summary?: string | null;
    summaryError?: string | null;
}

export interface DocumentHistoryDto {
    id: number;
    status: DocumentStatus;
    changedAt: string;
    comment: string | null;
}

async function request<T>(path: string, method = 'GET', body?: object): Promise<T> {
    const response = await fetch(API_URL + path, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.detail ?? `Request failed with status ${response.status}`);
    }
    if (response.status === 204) {
        return undefined as T;
    }
    return response.json();
}

export function getDocuments() {
    return request<DocumentDto[]>('');
}

export function searchDocuments(query: string) {
    return request<DocumentDto[]>(`/search?query=${encodeURIComponent(query)}`);
}

export function getDocument(id: string) {
    return request<DocumentDto>(`/${id}`);
}

export function getHistory(id: string) {
    return request<DocumentHistoryDto[]>(`/${id}/history`);
}

export function updateDocument(id: number, title: string) {
    return request<DocumentDto>(`/${id}`, 'PUT', { title });
}

export function changeStatus(id: number, status: DocumentStatus, comment: string | null) {
    return request<DocumentDto>(`/${id}/status`, 'PATCH', { status, comment });
}

export function deleteDocument(id: number) {
    return request<void>(`/${id}`, 'DELETE');
}

export function retrySummary(id: number) {
    return request<DocumentDto>(`/${id}/summary`, 'POST');
}

export function uploadDocument(uri: string, name: string, title: string) {
    const formData = new FormData();
    if (title) {
        formData.append('title', title);
    }
    formData.append('file', { uri, name, type: 'application/pdf' } as unknown as Blob);
    return new Promise<DocumentDto>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', API_URL);
        xhr.responseType = 'json';
        xhr.onload = () => {
            if (xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(new Error(xhr.response?.detail ?? `Upload failed with status ${xhr.status}`));
            }
        };
        xhr.onerror = () => reject(new Error('Network request failed'));
        xhr.send(formData);
    });
}

export function documentFileUrl(id: number) {
    return `${API_URL}/${id}/file`;
}

export type SummaryState = 'waiting-for-ocr' | 'pending' | 'done' | 'failed' | 'unavailable';

export function summaryState(doc: DocumentDto): SummaryState {
    if (doc.content == null) return 'waiting-for-ocr';
    if (doc.summary) return 'done';
    if (doc.summaryError) return 'failed';
    if (doc.summary === null && doc.summaryError === null) return 'pending';
    return 'unavailable';
}

export function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}
