# S.U.D.E. — Synthetic User Discovery Engine

> AI-powered behavioral simulation that stress-tests your product through synthetic personas before real users ever touch it.

## The Problem

Traditional user testing is slow, expensive, and biased by small sample sizes. S.U.D.E. replaces this with **synthetic persona simulations** — AI agents that navigate your product, surface friction points, and generate sentiment analysis reports automatically.

## Discovery-to-Deployment Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Intake Lab  │ ──▶ │  Trigger Sentinel │ ──▶ │  Dust.tt AI Sim  │ ──▶ │ Sentinel Callback │
│  (Target URL │     │  (Edge Function)  │     │  (Agentic Layer) │     │  (Save + Publish) │
│  + Personas) │     └──────────────────┘     └─────────────────┘     └──────────────────┘
└─────────────┘                                                              │
                                                                             ▼
                                                                   ┌──────────────────┐
                                                                   │  GitHub Report    │
                                                                   │  (Markdown)       │
                                                                   └──────────────────┘
```

1. **Intake Lab** — Enter a target URL and configure synthetic persona traits.
2. **Trigger Sentinel** — A backend function packages the personas and fires a webhook to Dust.tt.
3. **AI Simulation** — Dust.tt agents crawl the target, simulating real user behavior.
4. **Sentinel Callback** — Results are saved to the database and a Markdown report is committed to GitHub.

## Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | React + Vite + Tailwind CSS | Dashboard, Intake Lab, Simulation Theater |
| **Backend** | Lovable Cloud (PostgreSQL + Edge Functions) | Data persistence, orchestration |
| **AI Layer** | Dust.tt | Agentic simulation via webhook triggers |
| **Publishing** | GitHub API | Auto-commit Markdown reports to repo |

## Setup

### Secrets (managed via Lovable Cloud)

All private credentials are stored as **Lovable Cloud Secrets** and injected into backend functions at runtime. No `.env` files are used.

| Secret | Purpose |
|--------|---------|
| `GITHUB_TOKEN` | Authenticates with GitHub API for report commits |
| `GITHUB_OWNER` | GitHub repository owner |
| `GITHUB_REPO` | GitHub repository name |

The Dust.tt webhook URL is currently hardcoded in the `trigger-sentinel` function.

### Local Development

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## Documentation

See [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md) for full API documentation and payload schemas.
