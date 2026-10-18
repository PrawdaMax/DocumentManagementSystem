import type { DocumentDto, DocumentHistoryDto, DocumentStatus, DocumentUpdateDto } from './types';

async function request<T>(path: string, method = 'GET', body?: object | FormData): Promise<T> {
    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = {};
    if (body && !isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`/api/documents${path}`, {
        method,
        headers,
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
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

export function uploadDocument(title: string, file: File) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    return request<DocumentDto>('', 'POST', formData);
}

export function updateDocument(id: number, updateDto: DocumentUpdateDto) {
    return request<DocumentDto>(`/${id}`, 'PUT', updateDto);
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