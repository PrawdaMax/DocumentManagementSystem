// Define Document models aligned with Java DTO entities
type DocumentStatus = 'RECEIVED' | 'IN_REVIEW' | 'DONE' | 'REJECTED' | 'ARCHIVED';

interface DocumentDto {
    id?: number;
    title: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedAt?: string;
    status?: DocumentStatus;
}

interface DocumentHistoryDto {
    id: number;
    status: DocumentStatus;
    changedAt: string;
    comment: string;
}

const LIFECYCLE_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
    RECEIVED: ['IN_REVIEW', 'REJECTED'],
    IN_REVIEW: ['DONE', 'REJECTED'],
    DONE: ['ARCHIVED'],
    REJECTED: ['IN_REVIEW'],
    ARCHIVED: [],
};

const STATUS_STYLES: Record<DocumentStatus, { bg: string; text: string; dot: string; label: string }> = {
    RECEIVED: { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-400', label: 'Received' },
    IN_REVIEW: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', label: 'In Review' },
    DONE: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500', label: 'Done' },
    REJECTED: { bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-500', label: 'Rejected' },
    ARCHIVED: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', label: 'Archived' },
};

let documentList: DocumentDto[] = [];
let currentDocument: DocumentDto | null = null;
let currentHistory: DocumentHistoryDto[] = [];
let pendingTransitionStatus: DocumentStatus | null = null;

const dom = {
    documentsTbody: document.getElementById('documents-tbody') as HTMLTableSectionElement,
    searchInput: document.getElementById('search-input') as HTMLInputElement,

    alertContainer: document.getElementById('alert-container') as HTMLDivElement,
    alertBanner: document.getElementById('alert-banner') as HTMLDivElement,
    alertIcon: document.getElementById('alert-icon') as unknown as SVGElement,
    alertMessage: document.getElementById('alert-message') as HTMLParagraphElement,
    closeAlertBtn: document.getElementById('close-alert-btn') as HTMLButtonElement,

    detailsPanel: document.getElementById('details-panel') as HTMLDivElement,
    detailsPlaceholder: document.getElementById('details-placeholder') as HTMLDivElement,
    detailsTitle: document.getElementById('details-title') as HTMLHeadingElement,
    detailsUploadedAt: document.getElementById('details-uploaded-at') as HTMLParagraphElement,
    detailsFilename: document.getElementById('details-filename') as HTMLSpanElement,
    detailsType: document.getElementById('details-type') as HTMLSpanElement,
    detailsSize: document.getElementById('details-size') as HTMLSpanElement,
    detailsStatusBadge: document.getElementById('details-status-badge') as HTMLSpanElement,
    closeDetailsBtn: document.getElementById('close-details-btn') as HTMLButtonElement,

    transitionButtons: document.getElementById('transition-buttons') as HTMLDivElement,
    transitionCommentWrapper: document.getElementById('transition-comment-wrapper') as HTMLDivElement,
    transitionComment: document.getElementById('transition-comment') as HTMLTextAreaElement,
    cancelTransitionBtn: document.getElementById('cancel-transition-btn') as HTMLButtonElement,
    submitTransitionBtn: document.getElementById('submit-transition-btn') as HTMLButtonElement,
    historyTimeline: document.getElementById('history-timeline') as HTMLUListElement,

    openCreateModalBtn: document.getElementById('open-create-modal-btn') as HTMLButtonElement,
    createModal: document.getElementById('create-modal') as HTMLDivElement,
    closeCreateModalBtn: document.getElementById('close-create-modal-btn') as HTMLButtonElement,
    cancelCreateBtn: document.getElementById('cancel-create-btn') as HTMLButtonElement,
    createDocumentForm: document.getElementById('create-document-form') as HTMLFormElement,

    editModal: document.getElementById('edit-modal') as HTMLDivElement,
    closeEditModalBtn: document.getElementById('close-edit-modal-btn') as HTMLButtonElement,
    cancelEditBtn: document.getElementById('cancel-edit-btn') as HTMLButtonElement,
    editDocumentForm: document.getElementById('edit-document-form') as HTMLFormElement,
};

window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    fetchAndRenderDocuments();
});

function setupEventListeners() {
    dom.closeAlertBtn.addEventListener('click', hideAlert);

    dom.searchInput.addEventListener('input', () => {
        renderDocumentsTable(dom.searchInput.value);
    });

    dom.closeDetailsBtn.addEventListener('click', closeDetailsPanel);

    dom.cancelTransitionBtn.addEventListener('click', hideCommentBox);
    dom.submitTransitionBtn.addEventListener('click', handleTransitionSubmit);

    dom.openCreateModalBtn.addEventListener('click', () => showModal(dom.createModal));
    dom.closeCreateModalBtn.addEventListener('click', () => hideModal(dom.createModal));
    dom.cancelCreateBtn.addEventListener('click', () => hideModal(dom.createModal));

    dom.closeEditModalBtn.addEventListener('click', () => hideModal(dom.editModal));
    dom.cancelEditBtn.addEventListener('click', () => hideModal(dom.editModal));

    dom.createDocumentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCreateDocument();
    });

    dom.editDocumentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleEditDocumentSubmit();
    });
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(path, options);

    if (!response.ok) {
        let errorMsg = `Server returned status code ${response.status}`;
        try {
            const errorJson = await response.json();
            if (errorJson.detail) {
                errorMsg = errorJson.detail;
            } else if (errorJson.message) {
                errorMsg = errorJson.message;
            }
        } catch {
        }
        throw new Error(errorMsg);
    }

    if (response.status === 204) {
        return null as T;
    }
    return response.json();
}

async function fetchAndRenderDocuments() {
    try {
        documentList = await fetchApi<DocumentDto[]>('/api/documents');
        renderDocumentsTable();
        if (currentDocument) {
            const updated = documentList.find(d => d.id === currentDocument!.id);
            if (updated) {
                await selectDocument(updated);
            } else {
                closeDetailsPanel();
            }
        }
    } catch (error: any) {
        showAlert('danger', `Failed to load documents: ${error.message}`);
    }
}

async function selectDocument(document: DocumentDto) {
    currentDocument = document;
    dom.detailsPlaceholder.classList.add('hidden');
    dom.detailsPanel.classList.remove('hidden');

    try {
        currentHistory = await fetchApi<DocumentHistoryDto[]>(`/api/documents/${document.id}/history`);
    } catch (err: any) {
        currentHistory = [];
        showAlert('warning', `Failed to load status history log: ${err.message}`);
    }

    renderDetailsPanel();
}

function closeDetailsPanel() {
    currentDocument = null;
    currentHistory = [];
    dom.detailsPanel.classList.add('hidden');
    dom.detailsPlaceholder.classList.remove('hidden');
    hideCommentBox();
}

async function handleCreateDocument() {
    const titleInput = document.getElementById('create-title') as HTMLInputElement;
    const filenameInput = document.getElementById('create-filename') as HTMLInputElement;
    const typeInput = document.getElementById('create-type') as HTMLInputElement;
    const sizeInput = document.getElementById('create-size') as HTMLInputElement;

    const doc: DocumentDto = {
        title: titleInput.value.trim(),
        fileName: filenameInput.value.trim() || undefined as any,
        contentType: typeInput.value.trim() || undefined as any,
        fileSize: sizeInput.value ? parseInt(sizeInput.value, 10) : undefined as any,
    };

    try {
        const created = await fetchApi<DocumentDto>('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc),
        });

        hideModal(dom.createModal);
        dom.createDocumentForm.reset();
        showAlert('success', `Document "${created.title}" was successfully created!`);
        await fetchAndRenderDocuments();
        await selectDocument(created);
    } catch (error: any) {
        showAlert('danger', `Failed to create document: ${error.message}`);
    }
}

function openEditModal(doc: DocumentDto) {
    (document.getElementById('edit-id') as HTMLInputElement).value = String(doc.id);
    (document.getElementById('edit-title') as HTMLInputElement).value = doc.title;
    (document.getElementById('edit-filename') as HTMLInputElement).value = doc.fileName || '';
    (document.getElementById('edit-type') as HTMLInputElement).value = doc.contentType || '';
    (document.getElementById('edit-size') as HTMLInputElement).value = doc.fileSize != null ? String(doc.fileSize) : '';

    showModal(dom.editModal);
}

async function handleEditDocumentSubmit() {
    const id = parseInt((document.getElementById('edit-id') as HTMLInputElement).value, 10);
    const title = (document.getElementById('edit-title') as HTMLInputElement).value.trim();
    const fileName = (document.getElementById('edit-filename') as HTMLInputElement).value.trim();
    const contentType = (document.getElementById('edit-type') as HTMLInputElement).value.trim();
    const sizeVal = (document.getElementById('edit-size') as HTMLInputElement).value;
    const fileSize = sizeVal ? parseInt(sizeVal, 10) : 0;

    const updatedDoc: DocumentDto = {
        title,
        fileName,
        contentType,
        fileSize,
    };

    try {
        await fetchApi<DocumentDto>(`/api/documents/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedDoc),
        });

        hideModal(dom.editModal);
        showAlert('success', 'Document metadata updated successfully!');
        await fetchAndRenderDocuments();
    } catch (err: any) {
        showAlert('danger', `Failed to update document metadata: ${err.message}`);
    }
}

async function handleDeleteDocument(id: number, title: string) {
    if (!confirm(`Are you sure you want to delete the document "${title}"? This will delete the status history log as well.`)) {
        return;
    }

    try {
        await fetchApi<void>(`/api/documents/${id}`, { method: 'DELETE' });
        showAlert('success', `Document "${title}" deleted successfully.`);
        if (currentDocument?.id === id) {
            closeDetailsPanel();
        }
        await fetchAndRenderDocuments();
    } catch (error: any) {
        showAlert('danger', `Failed to delete document: ${error.message}`);
    }
}

function initiateStatusTransition(targetStatus: DocumentStatus) {
    pendingTransitionStatus = targetStatus;
    dom.transitionComment.value = '';
    dom.transitionCommentWrapper.classList.remove('hidden');
    dom.transitionComment.focus();
}

function hideCommentBox() {
    pendingTransitionStatus = null;
    dom.transitionCommentWrapper.classList.add('hidden');
    dom.transitionComment.value = '';
}

async function handleTransitionSubmit() {
    if (!currentDocument || !currentDocument.id || !pendingTransitionStatus) return;

    const commentText = dom.transitionComment.value.trim();
    const statusPayload = {
        status: pendingTransitionStatus,
        comment: commentText || undefined,
    };

    try {
        const updated = await fetchApi<DocumentDto>(`/api/documents/${currentDocument.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statusPayload),
        });

        showAlert('success', `Status successfully changed to ${STATUS_STYLES[pendingTransitionStatus].label}!`);
        hideCommentBox();
        await fetchAndRenderDocuments();
        await selectDocument(updated);
    } catch (err: any) {
        showAlert('danger', `Transition rejected: ${err.message}`);
    }
}

function renderDocumentsTable(filter = '') {
    const query = filter.toLowerCase().trim();
    const filtered = documentList.filter(d =>
        d.title.toLowerCase().includes(query) ||
        (d.fileName && d.fileName.toLowerCase().includes(query)) ||
        (d.status && d.status.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
        dom.documentsTbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-8 text-center text-slate-400">
          No documents found matching "${filter}".
        </td>
      </tr>
    `;
        return;
    }

    dom.documentsTbody.innerHTML = filtered.map(doc => {
        const status = doc.status || 'RECEIVED';
        const style = STATUS_STYLES[status];
        const uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'N/A';
        const sizeFormatted = doc.fileSize != null ? formatBytes(doc.fileSize) : 'Unknown size';

        return `
      <tr class="hover:bg-slate-50 transition cursor-pointer select-none" data-id="${doc.id}">
        <td class="px-6 py-4 max-w-xs truncate" onclick="window.selectDocById(${doc.id})">
          <div class="font-semibold text-slate-900 truncate">${escapeHtml(doc.title)}</div>
          <div class="text-xs text-slate-400 mt-1">${uploadDate}</div>
        </td>
        <td class="px-6 py-4 text-xs" onclick="window.selectDocById(${doc.id})">
          <div class="font-mono text-slate-600 truncate max-w-[150px]">${escapeHtml(doc.fileName || 'N/A')}</div>
          <div class="text-slate-400 mt-0.5">${sizeFormatted} • ${escapeHtml(doc.contentType || 'N/A')}</div>
        </td>
        <td class="px-6 py-4" onclick="window.selectDocById(${doc.id})">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}">
            <span class="h-1.5 w-1.5 rounded-full ${style.dot} mr-1.5"></span>
            ${style.label}
          </span>
        </td>
        <td class="px-6 py-4 text-right space-x-1 whitespace-nowrap">
          <button class="text-indigo-600 hover:text-indigo-900 font-semibold text-xs px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded transition" onclick="window.editDocById(${doc.id}, event)">
            Edit
          </button>
          <button class="text-rose-600 hover:text-rose-900 font-semibold text-xs px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded transition" onclick="window.deleteDocById(${doc.id}, '${escapeQuote(doc.title)}', event)">
            Delete
          </button>
        </td>
      </tr>
    `;
    }).join('');
}

function renderDetailsPanel() {
    if (!currentDocument) return;

    const status = currentDocument.status || 'RECEIVED';
    const style = STATUS_STYLES[status];
    const formattedDate = currentDocument.uploadedAt ? new Date(currentDocument.uploadedAt).toLocaleString() : 'N/A';
    const sizeFormatted = currentDocument.fileSize != null ? formatBytes(currentDocument.fileSize) : 'Unknown size';

    dom.detailsTitle.textContent = currentDocument.title;
    dom.detailsUploadedAt.textContent = `Uploaded at: ${formattedDate}`;
    dom.detailsFilename.textContent = currentDocument.fileName || 'N/A';
    dom.detailsType.textContent = currentDocument.contentType || 'N/A';
    dom.detailsSize.textContent = sizeFormatted;

    dom.detailsStatusBadge.innerHTML = `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}">
      <span class="h-1.5 w-1.5 rounded-full ${style.dot} mr-1.5"></span>
      ${style.label}
    </span>
  `;

    // Render Transition choices
    const possibleTransitions = LIFECYCLE_TRANSITIONS[status] || [];
    if (possibleTransitions.length === 0) {
        dom.transitionButtons.innerHTML = `
      <p class="text-xs text-slate-400 italic">This document is in a terminal status (${style.label}). No further lifecycle transitions are allowed.</p>
    `;
    } else {
        dom.transitionButtons.innerHTML = possibleTransitions.map(target => {
            const targetStyle = STATUS_STYLES[target];
            return `
        <button onclick="window.triggerTransition('${target}')" class="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-semibold rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          Move to ${targetStyle.label}
        </button>
      `;
        }).join('');
    }

    if (currentHistory.length === 0) {
        dom.historyTimeline.innerHTML = `
      <p class="text-xs text-slate-400 italic py-2">No history entries available.</p>
    `;
    } else {
        dom.historyTimeline.innerHTML = currentHistory.map((history, idx) => {
            const historyStyle = STATUS_STYLES[history.status];
            const changeDate = new Date(history.changedAt).toLocaleString();
            const isLast = idx === currentHistory.length - 1;

            return `
        <li>
          <div class="relative pb-8">
            ${!isLast ? `<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>` : ''}
            <div class="relative flex space-x-3">
              <div>
                <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${historyStyle.bg}">
                  <span class="h-2.5 w-2.5 rounded-full ${historyStyle.dot}"></span>
                </span>
              </div>
              <div class="flex-1 min-w-0 pt-1.5">
                <div class="text-xs text-slate-500 flex justify-between space-x-2">
                  <span class="font-semibold text-slate-900">Changed to ${historyStyle.label}</span>
                  <time class="text-[10px] text-slate-400 font-medium">${changeDate}</time>
                </div>
                ${history.comment ? `
                  <div class="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 max-w-full break-words italic">
                    "${escapeHtml(history.comment)}"
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </li>
      `;
        }).join('');
    }
}

function showModal(modal: HTMLDivElement) {
    modal.classList.remove('hidden');
}

function hideModal(modal: HTMLDivElement) {
    modal.classList.add('hidden');
}

function showAlert(type: 'success' | 'warning' | 'danger', message: string) {
    dom.alertContainer.classList.remove('hidden');
    dom.alertMessage.textContent = message;

    if (type === 'success') {
        dom.alertBanner.className = 'p-4 rounded-md flex items-start space-x-3 bg-emerald-50 border border-emerald-100 text-emerald-800';
        dom.alertIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
        dom.alertIcon.setAttribute('class', 'h-5 w-5 text-emerald-600');
    } else if (type === 'warning') {
        dom.alertBanner.className = 'p-4 rounded-md flex items-start space-x-3 bg-amber-50 border border-amber-100 text-amber-800';
        dom.alertIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`;
        dom.alertIcon.setAttribute('class', 'h-5 w-5 text-amber-600');
    } else {
        dom.alertBanner.className = 'p-4 rounded-md flex items-start space-x-3 bg-rose-50 border border-rose-100 text-rose-800';
        dom.alertIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
        dom.alertIcon.setAttribute('class', 'h-5 w-5 text-rose-600');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAlert() {
    dom.alertContainer.classList.add('hidden');
}

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function escapeHtml(str: string): string {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeQuote(str: string): string {
    if (!str) return '';
    return str.replace(/'/g, "\\'");
}

(window as any).selectDocById = (id: number) => {
    const doc = documentList.find(d => d.id === id);
    if (doc) selectDocument(doc);
};

(window as any).editDocById = (id: number, event: Event) => {
    event.stopPropagation();
    const doc = documentList.find(d => d.id === id);
    if (doc) openEditModal(doc);
};

(window as any).deleteDocById = (id: number, title: string, event: Event) => {
    event.stopPropagation();
    handleDeleteDocument(id, title);
};

(window as any).triggerTransition = (status: DocumentStatus) => {
    initiateStatusTransition(status);
};