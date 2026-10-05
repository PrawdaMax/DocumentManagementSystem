import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import * as api from '../api';
import { Alert } from '../components/Alert';
import { DocumentForm } from '../components/DocumentForm';
import { StatusBadge } from '../components/StatusBadge';
import { formatBytes, formatDate } from '../format';
import type { DocumentDto, DocumentInput } from '../types';

export function DashboardPage() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<DocumentDto[]>([]);
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [error, setError] = useState('');

    // Dokumente einmal beim Öffnen der Seite laden
    useEffect(() => {
        api.getDocuments()
            .then(setDocuments)
            .catch(err => setError(err.message));
    }, []);

    const query = search.toLowerCase();
    const visibleDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(query) || doc.fileName?.toLowerCase().includes(query));

    async function createDocument(input: DocumentInput) {
        const created = await api.createDocument(input);
        navigate(`/documents/${created.id}`);
    }

    return (
        <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-bold">Documents</h2>
                <div className="flex gap-2">
                    <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search title or file name..."
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    <button onClick={() => setFormOpen(true)} className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white">
                        + New Document
                    </button>
                </div>
            </div>

            <Alert text={error} />

            {visibleDocuments.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No documents found.</p>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead>
                    <tr className="bg-slate-100 text-slate-600">
                        <th className="px-4 py-2">Title</th>
                        <th className="px-4 py-2">File</th>
                        <th className="px-4 py-2">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {visibleDocuments.map(doc => (
                        <tr key={doc.id}>
                            <td className="px-4 py-3">
                                <Link to={`/documents/${doc.id}`} className="font-semibold hover:text-indigo-600 hover:underline">
                                    {doc.title}
                                </Link>
                                <div className="text-xs text-slate-400">{formatDate(doc.uploadedAt)}</div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                                <div className="font-mono">{doc.fileName ?? 'N/A'}</div>
                                <div>{formatBytes(doc.fileSize)}</div>
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge status={doc.status} />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {formOpen && <DocumentForm doc={null} onSave={createDocument} onCancel={() => setFormOpen(false)} />}
        </section>
    );
}
