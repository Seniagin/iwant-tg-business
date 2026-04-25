# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # dev server on http://localhost:3300
npm run build          # production build → build/
npm run build:no-lint  # build skipping ESLint (DISABLE_ESLINT_PLUGIN=true)
npm test               # Jest in watch mode
npm run lint           # ESLint (zero-warning policy)
npm run deploy         # build + publish to gh-pages branch
```

## Environment Variables

Copy `env.example` to `.env.local`:

```
PORT=3300
REACT_APP_API_BASE_URL=http://localhost:3000   # Backend base URL (no trailing slash)
```

## What this app is

The **business-side** Telegram Mini App. Business owners open it inside Telegram to manage their profile (name, description, location, contacts, currency) and respond to client demands with offers.

Deployed to GitHub Pages: `https://seniagin.github.io/iwant-tg-business`

## Architecture

React 18 + TypeScript, bootstrapped with Create React App (not Vite, despite the README). No react-router — navigation is handled manually via `window.history.pushState` with `?page=<name>&request_id=<id>` URL params managed in `App.tsx`.

### Authentication flow

1. `telegramAuth.auth()` (singleton in `src/services/auth.ts`) calls `retrieveRawInitData()` from `@telegram-apps/sdk` and sends `POST /business-client/telegram-auth` with header `Authorization: tma <initData>`.
2. Backend returns a JWT token, stored in `localStorage` as `auth_token`.
3. All subsequent API calls in `src/services/api.ts` attach `Authorization: Bearer <token>`.
4. On app load, `AuthContext` checks the stored token via `GET /business-client/me`. If the token is missing or expired, it shows `LoginPage` where the user manually triggers auth.

When `window.Telegram.WebApp` is unavailable (browser dev), `UserContext` falls back to a hardcoded `demoUser` so the UI is navigable outside Telegram.

### Context layer

Two overlapping auth contexts exist — a known redundancy:

| Context | Used by | Owns |
|---|---|---|
| `AuthContext` | `App.tsx` (routing) | `isAuthenticated`, `isLoading`, raw `MeUser`, login/logout |
| `UserContext` | Pages and components | `user`, `business`, `refreshBusiness`, demo-mode fallback |
| `RequestContext` | Request list pages | demands list state |

### Services (`src/services/`)

- **`auth.ts`** — `AuthService` class wrapping `window.Telegram.WebApp`. Exposes haptic feedback, MainButton/BackButton helpers, and `telegramAuth` singleton.
- **`api.ts`** — `apiService` object with all backend calls. Central `apiRequest` / `apiJson` helpers handle auth headers, redirect detection, and 401/403 mapping.

### Routing / Pages

Navigation state lives in `App.tsx` as `currentPage: AppPage`. Pages:

| `?page=` value | Component | Purpose |
|---|---|---|
| `profile` (default) | `ProfilePage` | Business name, description, location, contacts, currency |
| `all-requests` | `AllRequestsPage` | Demands without business offers yet |
| `requests-with-offers` | `RequestsWithOffersPage` | Demands the business already responded to |
| `request-detail` | `RequestDetailPage` | Single demand detail + make/view offer |

`RequestsPage` is a tab-bar shell rendered above both request list pages.

### Maps

`LocationPicker` and `StaticLocationMap` use `react-leaflet` v4 with OpenStreetMap tiles. `src/setupLeafletDefaultIcons.ts` must be imported before any Leaflet render — it is imported at the app level in `index.tsx`.
