import { formatBytes, formatDate } from '../format';
import { STATUS } from '../status';
import type { DocumentDto, DocumentHistoryDto, DocumentStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { StatusChange } from './StatusChange';

interface DocumentDetailsProps {
    doc: DocumentDto;
    history: DocumentHistoryDto[];
    onChangeStatus: (status: DocumentStatus, comment: string | null) => Promise<void>;
    onClose: () => void;
}

const HEADING_STYLE = 'mb-2 text-xs font-bold text-slate-400 uppercase';

export function DocumentDetails({ doc, history, onChangeStatus, onClose }: DocumentDetailsProps) {
    return (
        <div className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="font-bold text-slate-900">{doc.title}</h2>
                    <p className="text-xs text-slate-400">Uploaded at {formatDate(doc.uploadedAt)}</p>
                </div>
                <button onClick={onClose} aria-label="Close details" className="text-lg text-slate-400">&times;</button>
            </div>

            <div className="space-y-1 rounded-md bg-slate-50 p-3 text-xs">
                <p><b>File:</b> {doc.fileName ?? 'N/A'}</p>
                <p><b>Type:</b> {doc.contentType ?? 'N/A'}</p>
                <p><b>Size:</b> {formatBytes(doc.fileSize)}</p>
                <p><b>Status:</b> <StatusBadge status={doc.status} /></p>
            </div>

            <section>
                <h3 className={HEADING_STYLE}>Change Status</h3>
                <StatusChange status={doc.status} onChange={onChangeStatus} />
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
    );
}
