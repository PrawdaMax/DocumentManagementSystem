export function Alert({ text }: { text: string }) {
    if (!text) return null;
    return <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{text}</p>;
}
