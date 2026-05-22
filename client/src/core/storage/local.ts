function reportStorageError(operation: string, error: unknown): void {
    if (import.meta.env.DEV) {
        console.warn(`Storage ${operation} failed`, error);
    }
}

export function storageGet<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
        reportStorageError('read', error);
        return null;
    }
}

export function storageSet<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        reportStorageError('write', error);
    }
}

export function storageRemove(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        reportStorageError('remove', error);
    }
}
