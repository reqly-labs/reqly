export const APP_NAME = 'Reqly';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'A modern, lightweight HTTP client for developers.';
export const APP_REPO = 'https://github.com/arturbomtempo/reqly';

export const DEFAULT_REQUEST_TIMEOUT = 30_000;

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
export const BODY_TYPES = ['none', 'json', 'text', 'xml', 'form', 'multipart'] as const;
export const AUTH_TYPES = ['none', 'bearer', 'basic', 'api-key'] as const;

export const SIDEBAR_MIN_WIDTH = 180;
export const SIDEBAR_MAX_WIDTH = 520;
export const SIDEBAR_DEFAULT_WIDTH = 256;
export const SIDEBAR_WIDTH_STORAGE_KEY = 'reqly:sidebar-width';
