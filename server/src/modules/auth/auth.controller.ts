import type { Request, Response } from 'express';
import { randomBytes, randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors.js';
import { upsertUser } from '../users/users.service.js';
import { buildGoogleAuthUrl, exchangeGoogleCode, generateToken } from './auth.service.js';
import type { OAuthUserInfo } from './auth.types.js';

function generateState(): string {
    return randomUUID();
}

function stateCookieOptions() {
    return {
        httpOnly: true,
        secure: env().NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 10 * 60 * 1000,
        path: '/auth',
    };
}

function isAllowedOrigin(origin: string): boolean {
    const clientUrl = env().CLIENT_URL.replace(/\/$/, '');
    return origin === clientUrl || /^http:\/\/localhost:\d+$/.test(origin);
}

function resolveTargetOrigin(origin?: string): string {
    const fallback = env().CLIENT_URL.replace(/\/$/, '');
    if (!origin) return fallback;
    return isAllowedOrigin(origin) ? origin : fallback;
}

function buildPostMessageHtml(data: object, targetOrigin: string): { html: string; nonce: string } {
    const nonce = randomBytes(16).toString('base64url');
    const json = JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script nonce="${nonce}">if(window.opener){window.opener.postMessage(${json},"${targetOrigin}");}window.close();<\/script></body></html>`;
    return { html, nonce };
}

function sendPostMessage(res: Response, data: object, targetOrigin: string): void {
    const { html, nonce } = buildPostMessageHtml(data, targetOrigin);
    res.setHeader(
        'Content-Security-Policy',
        `default-src 'none'; script-src 'nonce-${nonce}'`
    ).send(html);
}

export function redirectToGoogle(req: Request, res: Response): void {
    const state = generateState();
    const requestedOrigin = typeof req.query.origin === 'string' ? req.query.origin : undefined;
    const targetOrigin = resolveTargetOrigin(requestedOrigin);

    res.cookie('oauth_state_google', state, stateCookieOptions());
    res.cookie('oauth_target_origin', targetOrigin, stateCookieOptions());
    res.redirect(buildGoogleAuthUrl(state));
}

export async function handleGoogleCallback(req: Request, res: Response): Promise<void> {
    const { code, state } = req.query as { code?: string; state?: string };
    const storedState = req.cookies?.['oauth_state_google'] as string | undefined;
    const storedOrigin = req.cookies?.['oauth_target_origin'] as string | undefined;
    const targetOrigin = resolveTargetOrigin(storedOrigin);

    res.clearCookie('oauth_state_google', { path: '/auth' });
    res.clearCookie('oauth_target_origin', { path: '/auth' });

    if (!code || !state || !storedState || state !== storedState) {
        sendPostMessage(
            res,
            { type: 'auth-error', error: 'Invalid state or missing authorization code' },
            targetOrigin
        );
        return;
    }

    try {
        const userInfo = await exchangeGoogleCode(code);
        await sendAuthResponse(res, userInfo, targetOrigin);
    } catch {
        sendPostMessage(
            res,
            { type: 'auth-error', error: 'Google authentication failed' },
            targetOrigin
        );
    }
}

export function getMe(req: Request, res: Response): void {
    if (!req.user) throw new AppError(401, 'Unauthorized');
    res.json({ user: req.user });
}

async function sendAuthResponse(
    res: Response,
    userInfo: OAuthUserInfo,
    targetOrigin: string
): Promise<void> {
    const result = generateToken(userInfo);
    await upsertUser({
        id: result.user.uid,
        email: result.user.email,
        name: result.user.name,
        picture: result.user.picture,
        provider: userInfo.provider,
    });
    sendPostMessage(res, { type: 'auth-success', ...result }, targetOrigin);
}
