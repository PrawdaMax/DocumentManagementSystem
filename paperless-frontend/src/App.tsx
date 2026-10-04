import { useEffect, useState } from 'react';
import * as api from './api';
import { Alert, type Message } from './components/Alert';
import { DocumentDetails } from './components/DocumentDetails';
import { DocumentForm } from './components/DocumentForm';
import { DocumentTable } from './components/DocumentTable';
import { STATUS } from './status';
import type { DocumentDto, DocumentHistoryDto, DocumentInput, DocumentStatus } from './types';

export function App() {
    const [documents, setDocuments] = useState<DocumentDto[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [history, setHistory] = useState<DocumentHistoryDto[]>([]);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState<Message | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editedDoc, setEditedDoc] = useState<DocumentDto | null>(null); // null = neues Dokument

    const selected = documents.find(doc => doc.id === selectedId);
    const query = search.toLowerCase();
    const visibleDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(query) || doc.fileName?.toLowerCase().includes(query));

    // Dokumente einmal beim Öffnen der Seite laden
    useEffect(() => {
        loadDocuments();
    }, []);

    function showSuccess(text: string) {
        setMessage({ type: 'success', text });
    }

    function showError(text: string, error: unknown) {
        setMessage({ type: 'error', text: `${text}: ${(error as Error).message}` });
    }

    async function loadDocuments() {
        try {
            setDocuments(await api.getDocuments());
        } catch (error) {
            showError('Failed to load documents', error);
        }
    }

    async function selectDocument(id: number) {
        setSelectedId(id);
        setHistory([]);
        try {
            setHistory(await api.getHistory(id));
        } catch (error) {
            showError('Failed to load history', error);
        }
    }

    function openForm(doc: DocumentDto | null) {
        setEditedDoc(doc);
        setFormOpen(true);
    }

    // Kein try/catch: DocumentForm fängt Fehler ab und zeigt sie im Dialog an
    async function saveDocument(input: DocumentInput) {
        const saved = editedDoc
            ? await api.updateDocument(editedDoc.id, input)
            : await api.createDocument(input);
        setFormOpen(false);
        showSuccess(`Document "${saved.title}" was saved.`);
        await loadDocuments();
        await selectDocument(saved.id);
    }

    async function deleteDocument(doc: DocumentDto) {
        if (!window.confirm(`Delete "${doc.title}" and its history?`)) return;
        try {
            await api.deleteDocument(doc.id);
            showSuccess(`Document "${doc.title}" was deleted.`);
            await loadDocuments();
        } catch (error) {
            showError('Failed to delete document', error);
        }
    }

    async function changeStatus(id: number, status: DocumentStatus, comment: string | null) {
        try {
            await api.changeStatus(id, status, comment);
            showSuccess(`Status was changed to ${STATUS[status].label}.`);
            await loadDocuments();
            await selectDocument(id);
        } catch (error) {
            showError('Status change rejected', error);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <header className="flex items-center justify-between bg-indigo-600 px-6 py-4 text-white">
                <h1 className="text-lg font-bold">Paperless Rest DMS</h1>
                <button onClick={() => openForm(null)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-600">
                    + New Document
                </button>
            </header>

            <main className="mx-auto max-w-7xl space-y-6 p-6">
                {message && <Alert message={message} onClose={() => setMessage(null)} />}

                <div className="grid gap-6 lg:grid-cols-3">
                    <section className="rounded-lg bg-white p-4 shadow-sm lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="font-bold">Documents</h2>
                            <input
                                type="search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search title or file name..."
                                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                            />
                        </div>
                        <DocumentTable
                            documents={visibleDocuments}
                            selectedId={selectedId}
                            onSelect={doc => selectDocument(doc.id)}
                            onEdit={openForm}
                            onDelete={deleteDocument}
                        />
                    </section>

                    <aside>
                        {selected ? (
                            <DocumentDetails
                                key={selected.id} // anderes Dokument = neue Komponente, das Kommentarfeld wird geleert
                                doc={selected}
                                history={history}
                                onChangeStatus={(status, comment) => changeStatus(selected.id, status, comment)}
                                onClose={() => setSelectedId(null)}
                            />
                        ) : (
                            <p className="rounded-lg bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
                                Select a document to see its details and history.
                            </p>
                        )}
                    </aside>
                </div>
            </main>

            {formOpen && <DocumentForm doc={editedDoc} onSave={saveDocument} onCancel={() => setFormOpen(false)} />}
        </div>
    );
}
