import { prisma } from '../../infra/prisma.js';

export async function findAll(uid: string): Promise<unknown[]> {
    const rows = await prisma.collection.findMany({
        where: { userId: uid },
        select: { data: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((r) => r.data);
}

export async function replaceAll(uid: string, collections: unknown[]): Promise<void> {
    await prisma.$transaction([
        prisma.collection.deleteMany({ where: { userId: uid } }),
        ...collections.map((col, index) => {
            const data = col as Record<string, unknown>;
            const clientId = data.id as string;
            return prisma.collection.create({
                data: {
                    id: `${uid}:${clientId}`,
                    userId: uid,
                    sortOrder: index,
                    data: col as object,
                },
            });
        }),
    ]);
}
