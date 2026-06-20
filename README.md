This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Auth flow & protected routes

### Token storage strategy

Authentication uses a **dual-storage strategy** for the access token and a separate localStorage-only store for the refresh token:

| Token | Storage | Purpose |
|---|---|---|
| `access_token` | `localStorage` (`auth_token`) + cookie (`auth_token`) | Attached as `Authorization: Bearer` on every API request. Cookie mirrors localStorage so Next.js middleware can check auth server-side without accessing localStorage (unavailable in middleware). |
| `refresh_token` | `localStorage` (`refresh_token`) only | Used exclusively by the token-refresh flow to obtain a new access token. Never sent to cookies or exposed to middleware. |

Why not store the refresh token in a cookie? The refresh token is only consumed by the client-side JavaScript that calls `/auth/refresh`. Keeping it out of cookies reduces its exposure surface — middleware and server components never need it.

### Silent token refresh

When any API request returns HTTP 401 with `code: "ACCESS_TOKEN_EXPIRED"`, the client automatically:

1. Calls `POST /auth/refresh` with the stored refresh token.
2. Stores the new access token (and rotates the refresh token if the backend returns a new one).
3. Retries the original request with the new token.

Concurrent 401s are handled via a **single-flight pattern** (`src/lib/auth/refresh.ts`): only one refresh request is ever in flight at a time. Requests that arrive while a refresh is pending are queued and resolved with the same new token once the refresh completes.

On refresh failure (invalid/expired refresh token):
- All stored tokens are cleared.
- The user is redirected to `/login`.
- All queued requests are rejected.

Infinite refresh loops are prevented by the `_retry` flag on retried requests — a retried request that receives another 401 is thrown as an `ApiError` rather than triggering another refresh.

### Relevant source files

| File | Role |
|---|---|
| `src/lib/auth/token-store.ts` | Read/write/clear for both token types |
| `src/lib/auth/refresh.ts` | Single-flight refresh logic |
| `src/lib/api/client.ts` | HTTP client with 401 interceptor |
| `src/lib/auth/session.ts` | Cookie helpers + middleware token reader |
| `src/lib/auth/session.server.ts` | Server Component token reader |

### Protected routes

`src/middleware.ts` guards routes under `/dashboard/*` and `/profile/*`. Unauthenticated visitors are redirected to:

```
/login?redirect=/original-path
```

The login page reads `redirect` and sends the user to that path after sign-in (default: `/dashboard`).

### Public routes

These paths are reachable without a token:

- `/`
- `/login`
- `/signup`

Authenticated users who visit `/login` or `/signup` are redirected to `/dashboard`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
