import type { Collection } from '@/modules/request/types';
import { getToken } from '../auth';

const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
    throw new Error('VITE_API_URL is not defined. Check your .env file.');
}

function authHeaders(): HeadersInit {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};
}

export async function fetchCloudCollections(): Promise<Collection[]> {
    const res = await fetch(`${API_URL}/collections`, { headers: authHeaders() });
    if (!res.ok) return [];
    const data = (await res.json()) as { collections: Collection[] };
    return data.collections;
}

export async function saveCollectionsToCloud(collections: Collection[]): Promise<void> {
    await fetch(`${API_URL}/collections`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ collections }),
    });
}
