import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors.js';
import { findAll, replaceAll } from './collections.service.js';

export async function getCollections(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new AppError(401, 'Unauthorized');
    const collections = await findAll(req.user.uid);
    res.json({ collections });
}

export async function syncCollections(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new AppError(401, 'Unauthorized');

    const { collections } = req.body as { collections: unknown[] };

    if (!Array.isArray(collections)) {
        throw new AppError(400, 'collections must be an array');
    }

    await replaceAll(req.user.uid, collections);
    res.json({ ok: true });
}
