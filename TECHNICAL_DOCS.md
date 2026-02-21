# S.U.D.E. — Technical Documentation

## Architecture Overview

S.U.D.E. uses a webhook-driven architecture with three systems:

1. **Lovable (React)** — The frontend dashboard where users configure simulations.
2. **Lovable Cloud (PostgreSQL + Edge Functions)** — Orchestrates the simulation lifecycle and persists results.
3. **Dust.tt** — Executes AI agentic simulations against target URLs.

---

## Database Schema

### `discovery_projects`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated project ID |
| `name` | TEXT | Project display name |
| `url` | TEXT | Target URL to simulate |
| `status` | TEXT | `idle` → `scanning` → `simulating` → `complete` |
| `market_data` | JSONB | Raw simulation results from Dust.tt |
| `created_at` | TIMESTAMPTZ | Row creation time |

### `persona_snapshots`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `project_id` | UUID (FK) | References `discovery_projects.id` |
| `name` | TEXT | Persona display name |
| `traits` | JSONB | Persona configuration (age, tech level, goals, etc.) |
| `created_at` | TIMESTAMPTZ | Row creation time |

### `simulation_events`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `project_id` | UUID (FK) | References `discovery_projects.id` |
| `node_name` | TEXT | Page or component the persona interacted with |
| `action` | TEXT | What the persona did |
| `monologue` | TEXT | Internal reasoning of the AI persona |
| `sentiment_vector` | JSONB | Sentiment scores for this interaction |
| `timestamp` | TIMESTAMPTZ | Event time |

### `app_state`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Singleton row |
| `active_project_id` | UUID (FK) | Currently selected project |

---

## Edge Functions

### `trigger-sentinel`

**Purpose:** Initiates a simulation by sending project data to Dust.tt.

**Method:** `POST`

**Request Body:**

```json
{
  "project_id": "uuid-of-the-project"
}
```

**Internal Flow:**

1. Reads `discovery_projects` row to get the target `url`.
2. Reads `persona_snapshots` for the project to build persona traits.
3. Constructs a callback URL pointing to `sentinel-callback`.
4. Sends a `POST` to the Dust.tt webhook with:

```json
{
  "url": "https://target-site.com",
  "persona_traits": "[{\"name\":\"Alex\",\"age\":28,...}]",
  "callback_url": "https://<supabase-url>/functions/v1/sentinel-callback?project_id=<uuid>"
}
```

5. Updates project status to `simulating`.

**Response (200):**

```json
{
  "success": true,
  "dust_status": 200,
  "dust_response": "...",
  "callback_url": "https://..."
}
```

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Missing `project_id` |
| 404 | Project not found or missing URL |
| 500 | Unexpected server error |

---

### `sentinel-callback`

**Purpose:** Receives simulation results from Dust.tt, saves them, and publishes a Markdown report to GitHub.

**Method:** `POST`

**Query Parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `project_id` | Yes | The project to update |

**Request Body:** Raw JSON from Dust.tt containing simulation results. Expected shape:

```json
{
  "peak_friction": {
    "navigation": "Users struggled with the main menu",
    "checkout": "Payment flow caused 40% drop-off"
  },
  "sentiment_radar": {
    "trust": 0.72,
    "frustration": 0.45,
    "delight": 0.61
  }
}
```

**Internal Flow:**

1. Saves the JSON body to `discovery_projects.market_data`.
2. Updates status to `complete`.
3. Fetches the project URL for report naming.
4. Generates a Markdown report with:
   - Peak Friction section (bullet list)
   - Sentiment Radar section (table)
   - Full raw JSON data block
5. Commits the report to GitHub at `reports/<sanitized-url>.md`.

**Response (200):**

```json
{
  "success": true,
  "github": {
    "status": 201,
    "body": "..."
  }
}
```

---

## Secrets

All secrets are managed via **Lovable Cloud Secrets** and available as environment variables in Edge Functions.

| Secret | Used By | Description |
|--------|---------|-------------|
| `GITHUB_TOKEN` | `sentinel-callback` | Personal access token with `repo` scope |
| `GITHUB_OWNER` | `sentinel-callback` | GitHub username or org |
| `GITHUB_REPO` | `sentinel-callback` | Target repository name |
| `SUPABASE_URL` | Both functions | Auto-provided by Lovable Cloud |
| `SUPABASE_SERVICE_ROLE_KEY` | Both functions | Auto-provided by Lovable Cloud |

The **Dust.tt webhook URL** is currently hardcoded in `trigger-sentinel`. To change it, update the `DUST_WEBHOOK_URL` constant in `supabase/functions/trigger-sentinel/index.ts`.

---

## Status Lifecycle

```
idle → scanning → simulating → complete
```

| Status | Trigger |
|--------|---------|
| `scanning` | User clicks SCAN in Intake Lab |
| `simulating` | `trigger-sentinel` fires webhook to Dust.tt |
| `complete` | `sentinel-callback` receives results |
