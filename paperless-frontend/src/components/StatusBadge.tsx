import { STATUS } from '../status';
import type { DocumentStatus } from '../types';

export function StatusBadge({ status }: { status: DocumentStatus }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 align-middle text-xs font-semibold ${STATUS[status].color}`}>
            {status === 'PROCESSING' && <ClockIcon />}
            {STATUS[status].label}
        </span>
    );
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-3.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
