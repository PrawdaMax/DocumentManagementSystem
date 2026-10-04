export function formatBytes(bytes: number | null): string {
    if (bytes === null) return 'Unknown size';
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleString();
}
