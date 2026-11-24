import { useState, type FormEvent } from 'react';

interface UserNameFormProps {
    name: string;
    onSave: (name: string) => void;
    onCancel: () => void;
}

export function UserNameForm({ name, onSave, onCancel }: UserNameFormProps) {
    const [value, setValue] = useState(name);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        onSave(value.trim());
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-800/50 p-4 text-slate-800">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 rounded-lg bg-white p-6 shadow-lg">
                <h3 className="text-lg font-bold">Your Name</h3>
                <p className="text-sm text-slate-500">
                    Saved in this browser and shown in the history when you upload a document or change its status.
                </p>
                <label className="block text-xs font-semibold text-slate-600">
                    Name
                    <input
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        maxLength={100}
                        autoFocus
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800"
                    />
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
