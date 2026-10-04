import { useState } from 'react';
import { STATUS } from '../status';
import type { DocumentStatus } from '../types';

interface StatusChangeProps {
    status: DocumentStatus;
    onChange: (status: DocumentStatus, comment: string | null) => Promise<void>;
}

export function StatusChange({ status, onChange }: StatusChangeProps) {
    const [comment, setComment] = useState('');
    const nextStatuses = STATUS[status].next;

    async function changeTo(next: DocumentStatus) {
        await onChange(next, comment.trim() || null);
        setComment('');
    }

    if (nextStatuses.length === 0) {
        return <p className="text-xs text-slate-400 italic">{STATUS[status].label} is a final status.</p>;
    }

    return (
        <div className="space-y-2">
            <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Comment (optional)"
                rows={2}
                className="w-full rounded-md border border-slate-300 p-2 text-xs"
            />
            <div className="flex flex-wrap gap-2">
                {nextStatuses.map(next => (
                    <button key={next} onClick={() => changeTo(next)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold">
                        Move to {STATUS[next].label}
                    </button>
                ))}
            </div>
        </div>
    );
}
