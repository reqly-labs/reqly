import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../../infra/firebase.js';

interface UpsertUserInput {
    id: string;
    email: string;
    name: string;
    picture: string | null;
    provider: string;
}

export async function upsertUser(input: UpsertUserInput): Promise<void> {
    await db
        .collection('users')
        .doc(input.id)
        .set(
            {
                email: input.email,
                name: input.name,
                picture: input.picture ?? null,
                provider: input.provider,
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
        );
}
