import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { OAuthUserInfo, TokenResponse } from './auth.types.js';

export function buildGoogleAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: env().GOOGLE_CLIENT_ID,
        redirect_uri: getGoogleCallbackUrl(),
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string): Promise<OAuthUserInfo> {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code,
            client_id: env().GOOGLE_CLIENT_ID,
            client_secret: env().GOOGLE_CLIENT_SECRET,
            redirect_uri: getGoogleCallbackUrl(),
            grant_type: 'authorization_code',
        }),
    });

    if (!tokenRes.ok) {
        throw new Error('Failed to exchange Google authorization code');
    }

    const tokens = (await tokenRes.json()) as { access_token?: string };

    if (!tokens.access_token) {
        throw new Error('Google token response did not include an access token');
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
        throw new Error('Failed to load Google user profile');
    }

    const profile = (await userRes.json()) as {
        id: string;
        email: string;
        name: string;
        picture?: string;
    };

    if (!profile.id || !profile.email || !profile.name) {
        throw new Error('Google profile response is incomplete');
    }

    return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture ?? null,
        provider: 'google',
    };
}

export function generateToken(userInfo: OAuthUserInfo): TokenResponse {
    const uid = `${userInfo.provider}:${userInfo.id}`;

    const payload = {
        uid,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider: userInfo.provider,
    };

    const token = jwt.sign(payload, env().JWT_SECRET, { expiresIn: '30d' });

    return { token, user: payload };
}

function getServerBaseUrl(): string {
    if (env().SERVER_URL) return env().SERVER_URL as string;
    if (env().NODE_ENV === 'production' && process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return `http://localhost:${env().PORT}`;
}

function getGoogleCallbackUrl(): string {
    return `${getServerBaseUrl()}/auth/google/callback`;
}
