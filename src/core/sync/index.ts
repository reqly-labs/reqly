import type { Collection } from '@/modules/request/types';
import type { User } from 'firebase/auth';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    setDoc,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../auth/firebase';

function getUserCollectionsRef(uid: string) {
    return collection(db, 'users', uid, 'collections');
}

export async function fetchCloudCollections(uid: string): Promise<Collection[]> {
    const ref = getUserCollectionsRef(uid);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((d) => d.data() as Collection);
}

export async function saveCollectionsToCloud(
    uid: string,
    collections: Collection[]
): Promise<void> {
    const ref = getUserCollectionsRef(uid);

    const snapshot = await getDocs(ref);
    const existingIds = new Set(snapshot.docs.map((d) => d.id));
    const currentIds = new Set(collections.map((c) => c.id));

    const deletions = [...existingIds]
        .filter((id) => !currentIds.has(id))
        .map((id) => deleteDoc(doc(ref, id)));

    const upserts = collections.map((c) => setDoc(doc(ref, c.id), deepSerialize(c)));

    await Promise.all([...deletions, ...upserts]);
}

export function subscribeToCloudCollections(
    user: User,
    onUpdate: (collections: Collection[]) => void
): Unsubscribe {
    const ref = getUserCollectionsRef(user.uid);
    return onSnapshot(ref, (snapshot) => {
        const collections = snapshot.docs.map((d) => d.data() as Collection);
        onUpdate(collections);
    });
}

function deepSerialize(obj: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(obj)) as Record<string, unknown>;
}
