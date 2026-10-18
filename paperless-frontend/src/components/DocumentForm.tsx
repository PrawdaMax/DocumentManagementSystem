import { useState, type FormEvent } from 'react';
import type { DocumentDto } from '../types';
import { Alert } from './Alert';

interface DocumentFormProps {
    doc: DocumentDto | null;
    onUpload?: (title: string, file: File) => Promise<void>;
    onSaveTitle?: (title: string) => Promise<void>;
    onCancel: () => void;
}

const INPUT_STYLE = 'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800';
const LABEL_STYLE = 'block text-xs font-semibold text-slate-600';

export function DocumentForm({ doc, onUpload, onSaveTitle, onCancel }: DocumentFormProps) {
    const [title, setTitle] = useState(doc?.title ?? '');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError('');
        try {
            if (doc) {
                if (onSaveTitle) {
                    await onSaveTitle(title.trim());
                }
            } else {
                if (!file) {
                    setError('Please select a PDF file.');
                    return;
                }
                if (onUpload) {
                    await onUpload(title.trim(), file);
                }
            }
        } catch (err) {
            setError((err as Error).message);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-800/50 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 rounded-lg bg-white p-6 shadow-lg">
                <h3 className="text-lg font-bold">{doc ? 'Edit Document Title' : 'Upload Document'}</h3>
                <Alert text={error} />

                <label className={LABEL_STYLE}>
                    Title *
                    <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={255} className={INPUT_STYLE} />
                </label>

                {!doc && (
                    <label className={LABEL_STYLE}>
                        PDF File *
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            required
                            onChange={e => setFile(e.target.files?.[0] ?? null)}
                            className={INPUT_STYLE}
                        />
                    </label>
                )}

                <div className="flex justify-end gap-2 pt-2 text-sm">
                    <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 font-semibold">
                        Cancel
                    </button>
                    <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
                        {doc ? 'Save' : 'Upload'}
                    </button>
                </div>
            </form>
        </div>
    );
}