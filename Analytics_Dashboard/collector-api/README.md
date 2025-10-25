# HappyRobot Analytics Collector API

FastAPI backend for collecting and analyzing carrier call data from the HappyRobot platform.

## Features

- **Webhook Ingestion**: Receive call completion events from HappyRobot
- **Analytics Endpoints**: Comprehensive metrics and breakdowns
- **Carrier Intelligence**: Recommendations and insights
- **API Key Authentication**: Secure access control
- **PostgreSQL Storage**: Reliable data persistence

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env
   # Edit .env with your database URL and API keys
   ```

3. **Run the application:**
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Seed mock data:**
   ```bash
   python scripts/seed_mock_data.py
   ```

### Docker

```bash
docker build -t collector-api .
docker run -p 8000:8000 --env-file .env collector-api
```

## API Endpoints

### Ingest
- `POST /api/v1/events/call-completed` - Receive call events (requires INGEST_API_KEY)

### Metrics
- `GET /api/v1/metrics/overview` - Overview KPIs (requires READ_API_KEY)
- `GET /api/v1/metrics/trends` - Time-series data (requires READ_API_KEY)

### Breakdowns
- `GET /api/v1/breakdowns/by-route` - Route performance (requires READ_API_KEY)
- `GET /api/v1/breakdowns/by-equipment` - Equipment analysis (requires READ_API_KEY)
- `GET /api/v1/breakdowns/by-carrier` - Carrier insights (requires READ_API_KEY)

### Intelligence
- `GET /api/v1/intelligence/recommendations` - Carrier recommendations (requires READ_API_KEY)

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `INGEST_API_KEY` - API key for webhook ingestion
- `READ_API_KEY` - API key for analytics endpoints
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)

## Health Check

- `GET /health` - Service health status

## Example Webhook Payload

```json
{
  "event_id": "evt_123",
  "call_id": "call_456",
  "carrier": {
    "mc_number": "123456",
    "name": "Acme Transport"
  },
  "load": {
    "load_id": "L-901",
    "origin": "Chicago, IL",
    "destination": "Dallas, TX",
    "equipment_type": "Flatbed",
    "loadboard_rate": 1800,
    "miles": 925
  },
  "negotiation_rounds": 2,
  "final_agreed_rate": 1650,
  "outcome": "accepted",
  "sentiment_score": 0.42,
  "started_at": "2025-10-23T15:21:00Z",
  "ended_at": "2025-10-23T15:28:30Z"
}
```
