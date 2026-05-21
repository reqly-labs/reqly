import type { Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/errors.js';
import { findAll, replaceAll } from './collections.service.js';

const collectionSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    requests: z.array(z.unknown()).default([]),
    folders: z.array(z.unknown()).optional(),
});

const syncCollectionsSchema = z.object({
    collections: z.array(collectionSchema),
});

export async function getCollections(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new AppError(401, 'Unauthorized');
    const collections = await findAll(req.user.uid);
    res.json({ collections });
}

export async function syncCollections(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new AppError(401, 'Unauthorized');

    const parsed = syncCollectionsSchema.safeParse(req.body);

    if (!parsed.success) {
        throw new AppError(400, 'Invalid collections payload');
    }

    const ids = new Set(parsed.data.collections.map((collection) => collection.id));
    if (ids.size !== parsed.data.collections.length) {
        throw new AppError(400, 'Collection ids must be unique');
    }

    await replaceAll(req.user.uid, parsed.data.collections);
    res.json({ ok: true });
}
