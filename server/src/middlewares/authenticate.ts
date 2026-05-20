import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../shared/errors.js';

export interface AuthPayload {
    uid: string;
    email: string;
    name: string;
    picture: string | null;
    provider: 'google';
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = header.slice(7);

    try {
        const payload = jwt.verify(token, env().JWT_SECRET) as AuthPayload;
        req.user = payload;
        next();
    } catch {
        throw new UnauthorizedError('Invalid or expired token');
    }
}
