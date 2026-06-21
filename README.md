This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Auth flow & protected routes

Authentication uses a **dual-storage strategy**:

- **`localStorage`** (`auth_token`) — used by the browser API client to attach `Authorization: Bearer <token>` headers.
- **`auth_token` cookie** — mirrored on login/logout so Next.js middleware can read the session on the edge without `localStorage` (which is unavailable in middleware).

After a successful login, `api.setToken()` writes to both stores. `api.clearToken()` removes both.

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

### Session helpers

`src/lib/auth/session.ts` exports:

- `getTokenFromRequest(request)` / `isAuthenticatedFromRequest(request)` — for middleware
- `setAuthCookie()` / `clearAuthCookie()` — client-side cookie sync

`src/lib/auth/session.server.ts` exports:

- `getToken()` — async, for Server Components (`cookies()`)
- `isAuthenticated()`

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

## CI checks

[![Frontend CI](https://github.com/GrantFoxTech/myFans_frontend/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/GrantFoxTech/myFans_frontend/actions/workflows/frontend-ci.yml)

Every pull request runs these checks in order — all must pass before merging:

| Step | Command | What it catches |
|------|---------|-----------------|
| Lint | `npm run lint` | ESLint rule violations |
| Type check | `npm run typecheck` | TypeScript type errors |
| Unit tests | `npm run test` | Logic regressions |
| Build | `npm run build` | Compile-time errors, bad imports |

### Fixing failures locally

```bash
# Lint errors
npm run lint
# Auto-fixable issues
npx next lint --fix

# Type errors
npm run typecheck

# Test failures
npm run test

# Build errors
npm run build
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
