import { STATUS } from '../status';
import type { DocumentStatus } from '../types';

export function StatusBadge({ status }: { status: DocumentStatus }) {
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[status].color}`}>
            {STATUS[status].label}
        </span>
    );
}
