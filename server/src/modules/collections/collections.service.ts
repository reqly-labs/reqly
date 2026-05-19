import { getFirestore } from '../../infra/firebase.js';

export function getUserCollectionsRef(uid: string) {
    return getFirestore().collection('users').doc(uid).collection('collections');
}

export async function findAll(uid: string): Promise<unknown[]> {
    const snapshot = await getUserCollectionsRef(uid).get();
    return snapshot.docs.map((doc) => doc.data());
}

export async function replaceAll(uid: string, collections: unknown[]): Promise<void> {
    const ref = getUserCollectionsRef(uid);
    const batch = getFirestore().batch();

    const existing = await ref.get();
    existing.docs.forEach((doc) => batch.delete(doc.ref));

    for (const col of collections) {
        const data = col as Record<string, unknown>;
        const id = data.id as string;
        batch.set(ref.doc(id), data);
    }

    await batch.commit();
}
