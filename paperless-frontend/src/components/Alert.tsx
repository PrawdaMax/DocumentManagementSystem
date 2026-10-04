export interface Message {
    type: 'success' | 'error';
    text: string;
}

interface AlertProps {
    message: Message;
    onClose: () => void;
}

export function Alert({ message, onClose }: AlertProps) {
    const color = message.type === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-rose-200 bg-rose-50 text-rose-800';

    return (
        <div className={`flex items-center justify-between rounded-md border p-4 text-sm ${color}`}>
            <p>{message.text}</p>
            <button onClick={onClose} aria-label="Close message" className="font-bold">&times;</button>
        </div>
    );
}
