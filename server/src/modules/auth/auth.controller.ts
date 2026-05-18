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
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function buildPostMessageHtml(data: object): string {
  const json = JSON.stringify(data);
  return `<!DOCTYPE html><html><body><script>window.opener.postMessage(${json},"${env().CLIENT_URL}");window.close();</script></body></html>`;
}

function buildErrorHtml(message: string): string {
  return buildPostMessageHtml({ error: message });
}

export function redirectToGoogle(_req: Request, res: Response): void {
  const state = generateState();
  res.redirect(buildGoogleAuthUrl(state));
}

export function redirectToGitHub(_req: Request, res: Response): void {
  const state = generateState();
  res.redirect(buildGitHubAuthUrl(state));
}

export async function handleGoogleCallback(
  req: Request,
  res: Response,
): Promise<void> {
  const code = req.query.code as string | undefined;

  if (!code) {
    res.status(400).send(buildErrorHtml("Missing authorization code"));
    return;
  }

  try {
    const userInfo = await exchangeGoogleCode(code);
    sendAuthResponse(res, userInfo);
  } catch {
    res.status(500).send(buildErrorHtml("Google authentication failed"));
  }
}

export async function handleGitHubCallback(
  req: Request,
  res: Response,
): Promise<void> {
  const code = req.query.code as string | undefined;

  if (!code) {
    res.status(400).send(buildErrorHtml("Missing authorization code"));
    return;
  }

  try {
    const userInfo = await exchangeGitHubCode(code);
    sendAuthResponse(res, userInfo);
  } catch {
    res.status(500).send(buildErrorHtml("GitHub authentication failed"));
  }
}

export function getMe(req: Request, res: Response): void {
  if (!req.user) throw new AppError(401, "Unauthorized");
  res.json({ user: req.user });
}

function sendAuthResponse(res: Response, userInfo: OAuthUserInfo): void {
  const result = generateToken(userInfo);
  res.send(buildPostMessageHtml({ type: "auth-success", ...result }));
}
