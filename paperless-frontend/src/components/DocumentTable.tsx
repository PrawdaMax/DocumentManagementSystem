import { formatBytes, formatDate } from '../format';
import type { DocumentDto } from '../types';
import { StatusBadge } from './StatusBadge';

interface DocumentTableProps {
    documents: DocumentDto[];
    selectedId: number | null;
    onSelect: (doc: DocumentDto) => void;
    onEdit: (doc: DocumentDto) => void;
    onDelete: (doc: DocumentDto) => void;
}

export function DocumentTable({ documents, selectedId, onSelect, onEdit, onDelete }: DocumentTableProps) {
    if (documents.length === 0) {
        return <p className="py-8 text-center text-sm text-slate-400">No documents found.</p>;
    }

    return (
        <table className="w-full text-left text-sm">
            <thead>
            <tr className="bg-slate-100 text-slate-600">
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">File</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {documents.map(doc => (
                <tr key={doc.id} className={doc.id === selectedId ? 'bg-indigo-50' : ''}>
                    <td className="px-4 py-3">
                        <button onClick={() => onSelect(doc)} className="font-semibold text-slate-900 hover:text-indigo-600 hover:underline">
                            {doc.title}
                        </button>
                        <div className="text-xs text-slate-400">{formatDate(doc.uploadedAt)}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                        <div className="font-mono">{doc.fileName ?? 'N/A'}</div>
                        <div>{formatBytes(doc.fileSize)}</div>
                    </td>
                    <td className="px-4 py-3">
                        <StatusBadge status={doc.status} />
                    </td>
                    <td className="space-x-2 px-4 py-3 text-right">
                        <button onClick={() => onEdit(doc)} className="text-xs font-semibold text-indigo-600 hover:underline">
                            Edit
                        </button>
                        <button onClick={() => onDelete(doc)} className="text-xs font-semibold text-rose-600 hover:underline">
                            Delete
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
