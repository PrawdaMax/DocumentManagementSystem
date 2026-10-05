import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import * as api from '../api';
import { Alert } from '../components/Alert';
import { DocumentForm } from '../components/DocumentForm';
import { StatusBadge } from '../components/StatusBadge';
import { StatusChange } from '../components/StatusChange';
import { formatBytes, formatDate } from '../format';
import { STATUS } from '../status';
import type { DocumentDto, DocumentHistoryDto, DocumentInput, DocumentStatus } from '../types';

const HEADING_STYLE = 'mb-2 text-xs font-bold text-slate-400 uppercase';

export function DocumentPage() {
    const id = Number(useParams().id);
    const navigate = useNavigate();
    const [doc, setDoc] = useState<DocumentDto | null>(null);
    const [history, setHistory] = useState<DocumentHistoryDto[]>([]);
    const [formOpen, setFormOpen] = useState(false);
    const [error, setError] = useState('');

    // Dokument und Verlauf laden, sobald sich die ID in der URL ändert
    useEffect(() => {
        api.getDocument(id).then(setDoc).catch(err => setError(err.message));
        api.getHistory(id).then(setHistory).catch(err => setError(err.message));
    }, [id]);

    async function updateDocument(input: DocumentInput) {
        setDoc(await api.updateDocument(id, input));
        setFormOpen(false);
    }

    async function deleteDocument() {
        if (!window.confirm('Delete this document and its history?')) return;
        try {
            await api.deleteDocument(id);
            navigate('/');
        } catch (err) {
            setError((err as Error).message);
        }
    }

    async function changeStatus(status: DocumentStatus, comment: string | null) {
        try {
            setDoc(await api.changeStatus(id, status, comment));
            setHistory(await api.getHistory(id));
            setError('');
        } catch (err) {
            setError((err as Error).message);
        }
    }

    return (
        <div className="space-y-4">
            <Link to="/" className="text-sm text-indigo-600 hover:underline">&larr; Back to documents</Link>
            <Alert text={error} />

            {doc && (
                <div className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold">{doc.title}</h2>
                            <p className="text-xs text-slate-400">Uploaded at {formatDate(doc.uploadedAt)}</p>
                        </div>
                        <div className="space-x-2 text-sm">
                            <button onClick={() => setFormOpen(true)} className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold">Edit</button>
                            <button onClick={deleteDocument} className="rounded-md bg-rose-600 px-3 py-1.5 font-semibold text-white">Delete</button>
                        </div>
                    </div>

                    <div className="space-y-1 rounded-md bg-slate-50 p-3 text-sm">
                        <p><b>File:</b> {doc.fileName ?? 'N/A'}</p>
                        <p><b>Type:</b> {doc.contentType ?? 'N/A'}</p>
                        <p><b>Size:</b> {formatBytes(doc.fileSize)}</p>
                        <p><b>Status:</b> <StatusBadge status={doc.status} /></p>
                    </div>

                    <section>
                        <h3 className={HEADING_STYLE}>Change Status</h3>
                        <StatusChange status={doc.status} onChange={changeStatus} />
                    </section>

                    <section>
                        <h3 className={HEADING_STYLE}>History</h3>
                        <ul className="space-y-3 text-xs">
                            {history.map(entry => (
                                <li key={entry.id} className="border-l-2 border-indigo-200 pl-3">
                                    <div className="flex justify-between">
                                        <b>{STATUS[entry.status].label}</b>
                                        <span className="text-slate-400">{formatDate(entry.changedAt)}</span>
                                    </div>
                                    {entry.comment && <p className="text-slate-600 italic">{entry.comment}</p>}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            )}

            {doc && formOpen && <DocumentForm doc={doc} onSave={updateDocument} onCancel={() => setFormOpen(false)} />}
        </div>
    );
}
