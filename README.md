# OmniSync

OmniSync is a browser-based demo for saving social profile links, checking account control through supported social sign-in flows, sketching cross-post routes, previewing posts, and exploring duplicate-loop handling.

## Run locally

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>.

## Checks

```bash
npm run lint
npm run build
```

## Social account sign-in

Profile links are local until the account owner signs in through the social network. The app sends OAuth authorization requests from its server and compares the returned handle with the saved profile when that provider exposes a handle. It keeps only a short-lived, signed, HttpOnly verification cookie; OAuth access tokens are not stored. This confirms control of an account during sign-in, not a person's legal identity. Publishing is a separate integration and remains disabled in this project.

### Configure local sign-in

1. Copy `.env.example` to `.env.local` and generate a random `OMNISYNC_AUTH_SECRET` with at least 32 characters.
2. Set `OMNISYNC_AUTH_BASE_URL=http://localhost:3000` for local development. Use the exact HTTPS site origin in production.
3. Create an OAuth app for each provider and add its callback URL. For example, the local X callback is `http://localhost:3000/api/auth/twitter/callback`; use the same `/api/auth/<platform>/callback` pattern for the other providers.
4. Put each provider's client ID and secret in the matching server environment variables in `.env.local` or the Vercel project's Environment Variables. Never prefix these secrets with `NEXT_PUBLIC_` or commit `.env.local`.
5. Restart the development server after changing environment variables, then use **Sign in** on each saved profile.

Implemented OAuth providers are X, Instagram, LinkedIn, Threads, YouTube, TikTok, and GitHub. LinkedIn does not expose a handle through its sign-in profile, so it can confirm sign-in but cannot automatically confirm that a saved LinkedIn URL matches. Bluesky requires its separate AT Protocol OAuth client metadata and DPoP flow, and custom profile links have no standard OAuth protocol; neither is treated as authenticated. The app will not ask users for social passwords.

### Deploy on Vercel

Push this folder to a Git repository, import that repository in Vercel, and deploy with the detected Next.js settings. Set `OMNISYNC_AUTH_BASE_URL` to the deployed HTTPS origin and add the required provider secrets under Vercel Project Settings → Environment Variables. Register callback URLs against that same origin in each provider's developer console. Keep preview and production OAuth apps and callback URLs aligned with their respective deployment origins. See the [Vercel Git deployment guide](https://vercel.com/docs/git).

## Current limits

- Profile links, routes, and activity are saved in each visitor's browser with `localStorage`.
- Composer and sync actions are local simulations. No post is sent to a social platform.
- OAuth sign-in is implemented for X, Instagram, LinkedIn, Threads, YouTube, TikTok, and GitHub when provider credentials are configured. Bluesky and custom links are not authenticated.
- Composer and sync actions remain local simulations. Real publishing needs provider write permissions, secure server-side token storage, and provider-specific API work.
- Webhook and polling endpoints return an unavailable/not implemented response until secure provider integrations are added.

Do not put provider secrets in client-side code or commit them to this repository.
