# DataAnalyzer — Client

The frontend for DataAnalyzer: a Next.js 14 app where users upload files into a workspace, chat with them, and see back analysis, charts, dashboards, CSV exports, and markdown reports as they're generated.

This is a practical getting-started guide. For how the whole system (frontend + backend) fits together, see [`../ARCHITECTURE.md`](../ARCHITECTURE.md) — there's also an in-app version of that explainer at `/architecture`.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Redux Toolkit, with RTK Query (`src/lib/api/apiSlice.ts`) as the single source of truth for server state — one API slice, tagged cache invalidation scoped per workspace/chat so mutating one doesn't refetch everything
- Tailwind CSS
- Server-Sent Events (native `EventSource`, `src/lib/sse.ts` + `useInvestigationStream.ts`) for streaming a running investigation's progress live, with reconnect-on-reload support
- `react-markdown` + `remark-gfm` for rendering assistant replies and markdown reports

## Prerequisites

- Node.js 18+
- The backend running somewhere reachable (see [`../Server/README.md`](../Server/README.md)) — this app is a pure client to that API, nothing runs standalone

## Environment setup

There are two separate env files, read in different contexts — don't mix them up:

- **`.env.local`** — read by `next dev` / `next build` when running the app directly on your machine (outside Docker):
  ```bash
  cp .env.local.example .env.local
  ```
- **`.env`** — read by `docker compose` (next to `docker-compose.yml`) for build-arg substitution when building the container image:
  ```bash
  cp .env.example .env
  ```

Both need the same two variables:

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL the browser calls for the API, including the `/api` prefix (e.g. `http://localhost:8000/api` locally, `https://your-domain/api` in prod). This is a **build-time** value — it gets baked into the JS bundle, so changing it means rebuilding, not just restarting. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Enables Google sign-in when set; leave blank to hide it. |

`.env` additionally sets `DOCKERHUB_USERNAME` and `IMAGE_TAG` for the Docker image build/push — irrelevant if you're just running locally.

## Running locally

### Option A — directly with Node

```bash
cd Client
npm install
npm run dev
```

Opens on `http://localhost:3000`. Requires `.env.local` to be set up first (see above) and the backend already running at whatever `NEXT_PUBLIC_API_URL` points to.

### Option B — Docker Compose

```bash
cd Client
docker compose up --build
```

Note the client is commented out of the **backend's** `docker-compose.yml` — the two are built/deployed as separate images, not one compose stack, since the frontend's build-time env var means it needs to be rebuilt independently of any backend deploy.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve a production build (`build` first) |
| `npm run lint` | Next.js/ESLint |

## Layout

```
src/
├── app/                  App Router pages
│   ├── chat/             Main workspace UI - file upload, chat, live investigation trail
│   ├── chart/[id]/       Standalone chart view
│   ├── report/[id]/      Standalone report/CSV view
│   ├── dashboard/[id]/   Standalone dashboard view
│   ├── login/, signup/, forgot-password/, verify-email/, profile/   Auth flows
│   └── architecture/     In-app architecture explainer
├── components/
│   ├── chat/              ChatLanding, InputBar, MessageList, InvestigationTrail,
│   │                       FilesPanel, ChatsPanel, DashboardPanel, ...
│   ├── auth/, cursor/, providers/   Supporting UI
├── hooks/                 use-file-uploads, use-elapsed-seconds, ...
└── lib/
    ├── api/apiSlice.ts     The RTK Query API slice - every REST call goes through here
    ├── sse.ts, useInvestigationStream.ts   Live investigation streaming
    ├── store.ts, hooks.ts  Redux setup
    └── types.ts            Shared TS types mirroring the backend's response shapes
```

## How it talks to the backend

Two channels:

1. **REST**, via the single RTK Query slice in `lib/api/apiSlice.ts`. Cache tags are scoped per workspace/chat/message (e.g. `{type: "Chart", id: "WORKSPACE-<id>"}`) so a mutation in one workspace never triggers a refetch of another's data. `credentials: "include"` is set on the base query since auth is cookie-based.
2. **Server-Sent Events**, for live investigation progress. `lib/sse.ts` opens an `EventSource` against the running investigation's stream; `useInvestigationStream.ts` wraps that so a page reload reconnects to a still-running investigation instead of assuming the tab that started it is still open (the backend tracks investigation state in Mongo/Redis regardless of any particular browser tab).

Every generated artifact (chart, report, CSV) is rendered from IDs the backend returns on the `Message` object (`chart_ids`, `report_id`, `csv_file_ids`) — never from links inside the assistant's own reply text, since those are only available in the model's output and can't be trusted as real URLs.

## Deeper reading

- [`../ARCHITECTURE.md`](../ARCHITECTURE.md) — full system design.
- `src/app/architecture/page.tsx` — the same explainer, rendered in-app at `/architecture`.
