const STORAGE_KEY = 'paperless-user-name';

export function getUserName(): string {
    return localStorage.getItem(STORAGE_KEY) ?? '';
}

export function saveUserName(name: string) {
    localStorage.setItem(STORAGE_KEY, name);
}
