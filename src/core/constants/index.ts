export const APP_NAME = 'Reqly';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'A modern, lightweight HTTP client for developers.';
export const APP_REPO = 'https://github.com/arturbomtempo/reqly';

export const DEFAULT_REQUEST_TIMEOUT = 30_000;

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
export const BODY_TYPES = ['none', 'json', 'text', 'xml', 'form'] as const;
