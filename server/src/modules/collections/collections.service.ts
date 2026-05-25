import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../../infra/firebase.js';

export async function findAll(uid: string): Promise<unknown[]> {
    const snapshot = await db
        .collection('users')
        .doc(uid)
        .collection('collections')
        .orderBy('sortOrder', 'asc')
        .get();

    return snapshot.docs.map((doc) => doc.data().data as unknown);
}

export async function replaceAll(uid: string, collections: unknown[]): Promise<void> {
    const colRef = db.collection('users').doc(uid).collection('collections');
    const existing = await colRef.get();
    const batch = db.batch();

    existing.docs.forEach((doc) => batch.delete(doc.ref));

    collections.forEach((col, index) => {
        const data = col as Record<string, unknown>;
        const clientId = data.id as string;
        batch.set(colRef.doc(clientId), {
            sortOrder: index,
            data: col,
            updatedAt: FieldValue.serverTimestamp(),
        });
    });

    await batch.commit();
}
