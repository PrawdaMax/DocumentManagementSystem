import type { DocumentDto, DocumentHistoryDto, DocumentInput, DocumentStatus } from './types';

async function request<T>(path: string, method = 'GET', body?: object): Promise<T> {
    const response = await fetch(`/api/documents${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        // Fehler kommen als Problem Details, die Meldung steht in "detail"
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

export function getDocument(id: number) {
    return request<DocumentDto>(`/${id}`);
}

export function createDocument(input: DocumentInput) {
    return request<DocumentDto>('', 'POST', input);
}

export function updateDocument(id: number, input: DocumentInput) {
    return request<DocumentDto>(`/${id}`, 'PUT', input);
}

export function deleteDocument(id: number) {
    return request<void>(`/${id}`, 'DELETE');
}

export function changeStatus(id: number, status: DocumentStatus, comment: string | null) {
    return request<DocumentDto>(`/${id}/status`, 'PATCH', { status, comment });
}

export function getHistory(id: number) {
    return request<DocumentHistoryDto[]>(`/${id}/history`);
}
