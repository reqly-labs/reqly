import { randomBytes, randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors.js";
import {
  buildGitHubAuthUrl,
  buildGoogleAuthUrl,
  exchangeGitHubCode,
  exchangeGoogleCode,
  generateToken,
} from "./auth.service.js";
import type { OAuthUserInfo } from "./auth.types.js";

function generateState(): string {
  return randomUUID();
}

function stateCookieOptions() {
  return {
    httpOnly: true,
    secure: env().NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 10 * 60 * 1000,
    path: "/auth",
  };
}

function buildPostMessageHtml(data: object): { html: string; nonce: string } {
  const nonce = randomBytes(16).toString("base64url");
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script nonce="${nonce}">if(window.opener){window.opener.postMessage(${json},"${env().CLIENT_URL}");}window.close();<\/script></body></html>`;
  return { html, nonce };
}

function sendPostMessage(res: Response, data: object): void {
  const { html, nonce } = buildPostMessageHtml(data);
  res
    .setHeader(
      "Content-Security-Policy",
      `default-src 'none'; script-src 'nonce-${nonce}'`,
    )
    .send(html);
}

export function redirectToGoogle(_req: Request, res: Response): void {
  const state = generateState();
  res.cookie("oauth_state_google", state, stateCookieOptions());
  res.redirect(buildGoogleAuthUrl(state));
}

export function redirectToGitHub(_req: Request, res: Response): void {
  const state = generateState();
  res.cookie("oauth_state_github", state, stateCookieOptions());
  res.redirect(buildGitHubAuthUrl(state));
}

export async function handleGoogleCallback(
  req: Request,
  res: Response,
): Promise<void> {
  const { code, state } = req.query as { code?: string; state?: string };
  const storedState = req.cookies?.["oauth_state_google"] as string | undefined;

  res.clearCookie("oauth_state_google", { path: "/auth" });

  if (!code || !state || !storedState || state !== storedState) {
    sendPostMessage(res, {
      error: "Invalid state or missing authorization code",
    });
    return;
  }

  try {
    const userInfo = await exchangeGoogleCode(code);
    sendAuthResponse(res, userInfo);
  } catch {
    sendPostMessage(res, { error: "Google authentication failed" });
  }
}

export async function handleGitHubCallback(
  req: Request,
  res: Response,
): Promise<void> {
  const { code, state } = req.query as { code?: string; state?: string };
  const storedState = req.cookies?.["oauth_state_github"] as string | undefined;

  res.clearCookie("oauth_state_github", { path: "/auth" });

  if (!code || !state || !storedState || state !== storedState) {
    sendPostMessage(res, {
      error: "Invalid state or missing authorization code",
    });
    return;
  }

  try {
    const userInfo = await exchangeGitHubCode(code);
    sendAuthResponse(res, userInfo);
  } catch {
    sendPostMessage(res, { error: "GitHub authentication failed" });
  }
}

export function getMe(req: Request, res: Response): void {
  if (!req.user) throw new AppError(401, "Unauthorized");
  res.json({ user: req.user });
}

function sendAuthResponse(res: Response, userInfo: OAuthUserInfo): void {
  const result = generateToken(userInfo);
  sendPostMessage(res, { type: "auth-success", ...result });
}
