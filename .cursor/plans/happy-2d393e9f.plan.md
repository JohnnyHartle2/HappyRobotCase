<!-- 2d393e9f-51f8-40d5-8076-9ac8769c4bc7 526b0712-0fa8-401a-adea-298f37ca8988 -->
# HappyRobot Loads API Plan (Fastify + TS + Prisma)

### Stack

- Node.js + Fastify + TypeScript
- Prisma ORM: Postgres (prod), SQLite (local)
- Security: API key auth (header `x-api-key`), HTTPS (self‑signed locally; managed cert in prod), basic rate limit
- Containerization: Docker + multi-stage build
- Deployment target: Railway or Fly.io (choose one; steps include both)

### Data Model (Prisma)

- File: `prisma/schema.prisma`
- Model `Load` with fields EXACTLY matching `casecontext.md` schema (snake_case):
- `load_id` String @id @default(cuid())
- `origin` String @db.Text
- `destination` String @db.Text
- `pickup_datetime` DateTime
- `delivery_datetime` DateTime
- `equipment_type` String
- `loadboard_rate` Decimal @db.Decimal(12,2)
- `notes` String? @db.Text
- `weight` Int?
- `commodity_type` String
- `num_of_pieces` Int
- `miles` Int
- `dimensions` String
- Indexes:
- `@@index([origin, destination, pickup_datetime])`
- `@@index([equipment_type, pickup_datetime])`
- `@@index([pickup_datetime])`
- `@@index([delivery_datetime])`
- `@@index([weight])`
- Keep snake_case in both DB and Prisma model to avoid mapping confusion. API and TS types will use the same names.

### API Contract (Fastify)

- Base path: `/api/v1`
- Auth: header `x-api-key` required on all endpoints; invalid/missing => 401/403
- Rate limit: 60 req/min per API key (burst 10)
- Endpoints (request/response bodies use snake_case field names exactly):
- `GET /loads` — searchable list
- Query params:
- `origin`, `destination`
- `pickup_datetime_from`, `pickup_datetime_to`
- `equipment_type`
- `min_loadboard_rate`, `max_loadboard_rate`
- `max_miles`
- `q` (free text in `notes` or `commodity_type`)
- `page`, `page_size`
- Returns: `{ data: Load[], page, page_size, total }` with snake_case fields
- `GET /loads/:load_id`
- `POST /loads` — create (server sets `load_id` if missing). Validates body against schema.
- `PUT /loads/:load_id` — update
- `DELETE /loads/:load_id` — delete
- Validation: `zod` schemas mirror snake_case names (via `fastify-type-provider-zod`)
- Pagination: offset (`page`, `page_size`, max 100)
- Sorting: default `pickup_datetime ASC`; optional `sort_by`, `sort_dir` (snake_case values)

### Project Structure

- `src/index.ts` — server bootstrap, HTTPS in local (self-signed), HTTP in prod behind platform TLS
- `src/config.ts` — env loading (`dotenv`), parse `DATABASE_URL`, `API_KEYS`, `NODE_ENV`
- `src/plugins/prisma.ts` — Prisma client singleton with Fastify plugin
- `src/plugins/rateLimit.ts` — `@fastify/rate-limit`
- `src/middleware/apiKeyAuth.ts` — validates `x-api-key`
- `src/modules/loads/loads.routes.ts` — registers routes
- `src/modules/loads/loads.schemas.ts` — zod schemas for snake_case models and queries
- `src/modules/loads/loads.service.ts` — Prisma queries with safe filters and indexes (snake_case fields)
- `src/modules/health/health.routes.ts` — `/healthz`

### Security

- API key auth via env `API_KEYS` (comma-separated). Reject missing/invalid keys.
- HTTPS:
- Local: generate self-signed certs under `certs/`; run Fastify HTTPS
- Prod: terminate TLS at platform (Railway/Fly) or managed cert; app serves HTTP internally
- Rate limiting per API key
- Input validation with `zod`; guardrails on `page_size` (<=100) and date ranges (<=1 year)
- Logging with `pino` and header redaction (`x-api-key`)

### Performance

- Prisma `where` filters using indexed snake_case columns
- Case-insensitive prefix search for `origin`/`destination` (lower() comparisons)

### Tooling & Scripts

- `package.json` scripts: `dev`, `build`, `start`, `migrate`, `generate`, `seed`, `lint`, `test`
- `prisma/seed.ts` — inserts sample loads with snake_case fields
- `scripts/gen-certs.sh` — mkcert/self-signed generation for local HTTPS
- `.env.example` — local config

### Docker

- `Dockerfile` multi-stage: builder (install, build), runner (`node:18-alpine`). Pass `DATABASE_URL`, `API_KEYS`, `NODE_ENV`, `PORT`. Do not bake `.env`.
- `docker-compose.yml` for local dev: app + `postgres:16` and optional `adminer`

### Deployment

- Railway
- Provision Postgres
- Set `DATABASE_URL`, `API_KEYS`, `NODE_ENV=production`
- Deploy command: `prisma migrate deploy && node dist/index.js`
- Fly.io
- `fly.toml` with HTTP service, TLS via Fly
- `fly secrets set DATABASE_URL=... API_KEYS=...`
- Release command: `prisma migrate deploy`

### Observability

- `pino` logger with redaction
- `/healthz` (no auth) and `/readyz` (DB check; unauthenticated)

### Testing

- Vitest e2e for auth, search filters, and pagination against SQLite (snake_case assertions)

### Documentation

- `README.md`: quickstart, curl examples (snake_case), deployment steps (Railway/Fly), HTTPS notes, env reference

### To-dos

- [ ] Initialize Fastify + TypeScript project skeleton with tooling
- [ ] Define Prisma schema for Load model and indexes
- [ ] Configure Prisma for SQLite local and Postgres prod
- [ ] Implement API key auth middleware using x-api-key header
- [ ] Enable per-key rate limiting with @fastify/rate-limit
- [ ] Implement /loads CRUD and search with validation and pagination
- [ ] Create prisma seed script to insert sample loads
- [ ] Add local HTTPS support and certificate generation script
- [ ] Create Dockerfile and docker-compose with Postgres service
- [ ] Provide Railway deployment config and steps
- [ ] Provide Fly.io deployment config and steps
- [ ] Write README with setup, API usage, and deployment instructions
- [ ] Add minimal e2e tests for auth, search, pagination