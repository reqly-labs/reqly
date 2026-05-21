import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { collectionsRouter } from '../modules/collections/collections.routes.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/collections', collectionsRouter);

router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
