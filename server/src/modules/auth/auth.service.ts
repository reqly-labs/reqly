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

export function buildGitHubAuthUrl(state: string): string {
    const { clientId } = getGitHubCredentials();
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: getGitHubCallbackUrl(),
        scope: 'read:user user:email',
        state,
    });
    return `https://github.com/login/oauth/authorize?${params}`;
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

    const tokens = (await tokenRes.json()) as { access_token: string };

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const profile = (await userRes.json()) as {
        id: string;
        email: string;
        name: string;
        picture?: string;
    };

    return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture ?? null,
        provider: 'google',
    };
}

export async function exchangeGitHubCode(code: string): Promise<OAuthUserInfo> {
    const { clientId, clientSecret } = getGitHubCredentials();
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: getGitHubCallbackUrl(),
        }),
    });

    const tokens = (await tokenRes.json()) as { access_token: string };

    const [userRes, emailsRes] = await Promise.all([
        fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                'User-Agent': 'Reqly',
            },
        }),
        fetch('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                'User-Agent': 'Reqly',
            },
        }),
    ]);

    const profile = (await userRes.json()) as {
        id: number;
        login: string;
        name?: string;
        avatar_url?: string;
    };

    const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
    }>;

    const primaryEmail =
        emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? '';

    return {
        id: String(profile.id),
        email: primaryEmail,
        name: profile.name ?? profile.login,
        picture: profile.avatar_url ?? null,
        provider: 'github',
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

function getGitHubCallbackUrl(): string {
    return `${getServerBaseUrl()}/auth/github/callback`;
}

function getGitHubCredentials(): { clientId: string; clientSecret: string } {
    const config = env();
    if (
        config.NODE_ENV === 'development' &&
        config.GITHUB_CLIENT_ID_DEV &&
        config.GITHUB_CLIENT_SECRET_DEV
    ) {
        return {
            clientId: config.GITHUB_CLIENT_ID_DEV,
            clientSecret: config.GITHUB_CLIENT_SECRET_DEV,
        };
    }
    return { clientId: config.GITHUB_CLIENT_ID, clientSecret: config.GITHUB_CLIENT_SECRET };
}
