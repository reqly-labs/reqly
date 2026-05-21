import { prisma } from '../../infra/prisma.js';

interface UpsertUserInput {
    id: string;
    email: string;
    name: string;
    picture: string | null;
    provider: string;
}

export async function upsertUser(input: UpsertUserInput): Promise<void> {
    await prisma.user.upsert({
        where: { id: input.id },
        create: input,
        update: {
            email: input.email,
            name: input.name,
            picture: input.picture,
        },
    });
}
