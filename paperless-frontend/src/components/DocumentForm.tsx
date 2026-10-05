import { useState, type FormEvent } from 'react';
import type { DocumentDto, DocumentInput } from '../types';
import { Alert } from './Alert';

interface DocumentFormProps {
    doc: DocumentDto | null;
    onSave: (input: DocumentInput) => Promise<void>; // darf einen Fehler werfen, das Formular zeigt ihn dann an
    onCancel: () => void;
}

const INPUT_STYLE = 'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800';
const LABEL_STYLE = 'block text-xs font-semibold text-slate-600';

export function DocumentForm({ doc, onSave, onCancel }: DocumentFormProps) {
    const [title, setTitle] = useState(doc?.title ?? '');
    const [fileName, setFileName] = useState(doc?.fileName ?? '');
    const [contentType, setContentType] = useState(doc?.contentType ?? '');
    const [fileSize, setFileSize] = useState(doc?.fileSize?.toString() ?? '');
    const [error, setError] = useState('');

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        try {
            await onSave({
                title: title.trim(),
                fileName: fileName.trim() || null,
                contentType: contentType.trim() || null,
                fileSize: fileSize === '' ? null : Number(fileSize),
            });
        } catch (err) {
            setError((err as Error).message);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-800/50 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 rounded-lg bg-white p-6 shadow-lg">
                <h3 className="text-lg font-bold">{doc ? 'Edit Metadata' : 'Create Document'}</h3>
                <Alert text={error} />

                {/* Der Browser prüft die Eingaben (required, maxLength, min, step) */}
                <label className={LABEL_STYLE}>
                    Title *
                    <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={255} className={INPUT_STYLE} />
                </label>
                <label className={LABEL_STYLE}>
                    File Name *
                    <input value={fileName} onChange={e => setFileName(e.target.value)} required maxLength={255} className={INPUT_STYLE} />
                </label>
                <label className={LABEL_STYLE}>
                    Content Type *
                    <input value={contentType} onChange={e => setContentType(e.target.value)} required maxLength={255} className={INPUT_STYLE} />
                </label>
                <label className={LABEL_STYLE}>
                    Size (Bytes) *
                    <input type="number" required min={0} step={1} value={fileSize} onChange={e => setFileSize(e.target.value)} className={INPUT_STYLE} />
                </label>

                <div className="flex justify-end gap-2 pt-2 text-sm">
                    <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 font-semibold">
                        Cancel
                    </button>
                    <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}
