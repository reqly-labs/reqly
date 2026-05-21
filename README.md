# Reqly

Reqly is a modern HTTP client for developers. It lets you compose and send
requests, inspect responses, organize collections, and sync saved requests to a
user account authenticated with Google.

The hosted app is intended for browser-accessible public APIs. To test APIs
running on `localhost`, run Reqly locally so the Vite development proxy can
forward those requests.

## Architecture

- `client/` - React, Vite, TypeScript, Zustand and Tailwind. This is the HTTP
  client interface.
- `server/` - Express, TypeScript, Prisma and PostgreSQL/Neon. This handles
  Google OAuth, JWT validation and collection sync.

The client remains local-first: tabs and request editing state live in browser
storage, while signed-in users can sync collections to the backend.

The backend is not a production request proxy. It exists for Google login and
collection sync only. This avoids running an open proxy from the hosted product.

## Main Features

- HTTP request builder with params, headers, body and auth editors.
- Support for JSON, XML, text, URL encoded forms and multipart form data.
- Response inspector with status, timing, size, headers, formatted text bodies
  and image previews.
- Request tabs, recent requests, collections and folders.
- Import from pasted cURL commands and copy requests as cURL.
- Google sign-in and cloud sync for saved collections.

## Local Development

Install dependencies for both apps:

```bash
cd server && npm install
cd ../client && npm install
```

Create environment files from the examples:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Run the API:

```bash
cd server
npm run dev
```

Run the client:

```bash
cd client
npm run dev
```

When running locally, set `client/.env` to the local API URL:

```bash
VITE_API_URL=http://localhost:3000
```

## Environment

Client:

- `VITE_API_URL` - base URL for the API server.

Server:

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `SERVER_URL` optional, useful in production OAuth redirects.
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
- `DIRECT_URL`

## Useful Commands

Client:

```bash
cd client
npm run build
npm run lint
npm run format
```

Server:

```bash
cd server
npm run build
npm run format
npm run db:migrate
```

## Deployment

Deploy `client/` and `server/` as separate Vercel projects.

Client production env:

- `VITE_API_URL=https://www.api.reqly.arturbomtempo.dev`

Server production env:

- `NODE_ENV=production`
- `CLIENT_URL=https://reqly.arturbomtempo.dev`
- `SERVER_URL=https://www.api.reqly.arturbomtempo.dev`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
- `DIRECT_URL`
