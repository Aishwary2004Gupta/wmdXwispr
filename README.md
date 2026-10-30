# OmniSync

OmniSync is a browser-based demo for saving social profile links, sketching cross-post routes, previewing posts, and exploring duplicate-loop handling.

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

## Deploy on Vercel

Push this folder to a Git repository, import that repository in Vercel, and deploy with the detected Next.js settings. This project currently needs no environment variables. Vercel can create preview deployments for pushes and a production deployment from the configured branch. See the [Vercel Git deployment guide](https://vercel.com/docs/git).

## Current limits

- Profile links, routes, and activity are saved in each visitor's browser with `localStorage`.
- Composer and sync actions are local simulations. No post is sent to a social platform.
- Accounts are not authenticated or verified. Real publishing needs platform-approved OAuth, server-side token storage, permissions, and provider-specific API work.
- Webhook and polling endpoints return an unavailable/not implemented response until secure provider integrations are added.

Do not put provider secrets in client-side code or commit them to this repository.
