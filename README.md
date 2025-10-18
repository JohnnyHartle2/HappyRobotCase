# HappyRobot Loads API

A secure, scalable API for managing freight loads with carrier automation capabilities. Built with Node.js, Fastify, TypeScript, and Prisma.

## Features

- 🔐 **API Key Authentication** - Secure access with configurable API keys
- 🚀 **High Performance** - Built on Fastify with optimized database queries
- 🔍 **Advanced Search** - Filter loads by origin, destination, equipment type, rates, and more
- 📊 **Pagination** - Efficient data retrieval with configurable page sizes
- 🛡️ **Rate Limiting** - Per-API-key rate limiting to prevent abuse
- 🔒 **HTTPS Support** - Secure communication with self-signed certs for local development
- 🐳 **Docker Ready** - Containerized with multi-stage builds
- ☁️ **Cloud Deployable** - Ready for Railway, Fly.io, and other platforms

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for containerized development)

### Local Development

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd happyrobot-loads-api
   npm install
   ```

2. **Set up environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database:**

   ```bash
   npm run generate
   npm run migrate
   npm run seed
   ```

4. **Generate HTTPS certificates (optional):**

   ```bash
   npm run gen-certs
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at:

- HTTP: `http://localhost:3000`
- HTTPS: `https://localhost:3000` (if certificates are generated)

### Docker Development

Quick start with PostgreSQL using Docker Compose:

1. **Start services:**

   ```bash
   docker compose up -d
   ```

2. **Run database migrations:**

   ```bash
   docker compose exec api npx prisma migrate deploy
   ```

3. **Seed database:**

   ```bash
   docker compose exec api npx prisma db seed
   ```

4. **Test the API:**

   ```bash
   # Health check
   curl http://localhost:3000/api/v1/healthz

   # API test
   curl -H "x-api-key: local-dev-key-123" "http://localhost:3000/api/v1/loads?page=1&page_size=10"
   ```

5. **Stop services:**
   ```bash
   docker compose down
   ```

**Note:** For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## API Usage

### Authentication

All endpoints require an API key in the `x-api-key` header:

```bash
curl -H "x-api-key: test-key-123" http://localhost:3000/api/v1/loads
```

### Endpoints

#### Search Loads

```bash
GET /api/v1/loads
```

**Query Parameters:**

- `origin` - Filter by origin location
- `destination` - Filter by destination location
- `pickup_datetime_from` - Filter loads after this date
- `pickup_datetime_to` - Filter loads before this date
- `equipment_type` - Filter by equipment type
- `min_loadboard_rate` - Minimum rate filter
- `max_loadboard_rate` - Maximum rate filter
- `max_miles` - Maximum distance filter
- `q` - Free text search in notes and commodity type
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)
- `sort_by` - Sort field (pickup_datetime, delivery_datetime, loadboard_rate, miles)
- `sort_dir` - Sort direction (asc, desc)

**Example:**

```bash
curl -H "x-api-key: test-key-123" \
  "http://localhost:3000/api/v1/loads?origin=Los Angeles&equipment_type=Dry Van&page=1&page_size=10"
```

#### Get Single Load

```bash
GET /api/v1/loads/:load_id
```

#### Create Load

```bash
POST /api/v1/loads
Content-Type: application/json

{
  "origin": "Los Angeles, CA",
  "destination": "Phoenix, AZ",
  "pickup_datetime": "2024-01-15T08:00:00Z",
  "delivery_datetime": "2024-01-15T18:00:00Z",
  "equipment_type": "Dry Van",
  "loadboard_rate": 850.00,
  "notes": "Expedited delivery required",
  "weight": 25000,
  "commodity_type": "Electronics",
  "num_of_pieces": 150,
  "miles": 370,
  "dimensions": "53ft x 8ft x 8.5ft"
}
```

#### Update Load

```bash
PUT /api/v1/loads/:load_id
Content-Type: application/json

{
  "loadboard_rate": 900.00,
  "notes": "Updated notes"
}
```

#### Delete Load

```bash
DELETE /api/v1/loads/:load_id
```

### Health Checks

- `GET /api/v1/healthz` - Basic health check
- `GET /api/v1/readyz` - Readiness check with database

## Database Schema

The `Load` model includes the following fields (all snake_case as specified):

| Field               | Type     | Description                        |
| ------------------- | -------- | ---------------------------------- |
| `load_id`           | String   | Unique identifier (auto-generated) |
| `origin`            | String   | Starting location                  |
| `destination`       | String   | Delivery location                  |
| `pickup_datetime`   | DateTime | Pickup date and time               |
| `delivery_datetime` | DateTime | Delivery date and time             |
| `equipment_type`    | String   | Type of equipment needed           |
| `loadboard_rate`    | Decimal  | Listed rate for the load           |
| `notes`             | String   | Additional information             |
| `weight`            | Int      | Load weight                        |
| `commodity_type`    | String   | Type of goods                      |
| `num_of_pieces`     | Int      | Number of items                    |
| `miles`             | Int      | Distance to travel                 |
| `dimensions`        | String   | Size measurements                  |

## Deployment

### Railway

1. **Create a new Railway project**
2. **Add PostgreSQL database**
3. **Set environment variables:**
   - `DATABASE_URL` - From PostgreSQL service
   - `API_KEYS` - Comma-separated API keys
   - `NODE_ENV=production`
4. **Deploy from GitHub or connect repository**

### Fly.io

1. **Install Fly CLI:**

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly:**

   ```bash
   fly auth login
   ```

3. **Create PostgreSQL database:**

   ```bash
   fly postgres create --name happyrobot-db
   ```

4. **Set secrets:**

   ```bash
   fly secrets set DATABASE_URL="postgresql://..." API_KEYS="prod-key-1,prod-key-2"
   ```

5. **Deploy:**
   ```bash
   fly deploy
   ```

### Environment Variables

| Variable        | Description                | Default                    |
| --------------- | -------------------------- | -------------------------- |
| `DATABASE_URL`  | Database connection string | `file:./dev.db`            |
| `API_KEYS`      | Comma-separated API keys   | `test-key-123,dev-key-456` |
| `NODE_ENV`      | Environment                | `development`              |
| `PORT`          | Server port                | `3000`                     |
| `HOST`          | Server host                | `0.0.0.0`                  |
| `HTTPS_ENABLED` | Enable HTTPS locally       | `true`                     |
| `SSL_CERT_PATH` | SSL certificate path       | `./certs/cert.pem`         |
| `SSL_KEY_PATH`  | SSL private key path       | `./certs/key.pem`          |

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run generate` - Generate Prisma client
- `npm run seed` - Seed database with sample data
- `npm run gen-certs` - Generate HTTPS certificates
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Project Structure

```
src/
├── index.ts                 # Server entry point
├── config.ts               # Configuration
├── plugins/                # Fastify plugins
│   ├── prisma.ts          # Database client
│   └── rateLimit.ts       # Rate limiting
├── middleware/             # Custom middleware
│   └── apiKeyAuth.ts      # API key authentication
└── modules/               # Feature modules
    ├── loads/             # Loads management
    │   ├── loads.routes.ts
    │   ├── loads.service.ts
    │   └── loads.schemas.ts
    └── health/            # Health checks
        └── health.routes.ts
```

## Security Features

- **API Key Authentication** - All endpoints require valid API keys
- **Rate Limiting** - 60 requests per minute per API key
- **Input Validation** - Zod schemas validate all inputs
- **HTTPS Support** - Secure communication in production
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **Header Redaction** - Sensitive headers are redacted from logs

## Performance

- **Database Indexes** - Optimized for common query patterns
- **Pagination** - Efficient data retrieval with configurable limits
- **Connection Pooling** - Prisma manages database connections
- **Compression** - Fastify compression middleware
- **Caching** - HTTP caching headers for static responses

## License

MIT License - see LICENSE file for details.
